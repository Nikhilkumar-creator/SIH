# Architecture Notes, Assumptions & Risks

> **Visual Diagrams & Flowcharts**: For interactive Mermaid architecture diagrams, user journey maps, AI ingestion sequences, and ER models, refer to [`docs/DIAGRAMS_AND_FLOWS.md`](./DIAGRAMS_AND_FLOWS.md).

## Assumptions made (spec was ambiguous or truncated here)

1. **Role check constraints were cut off in the source DDL** (`profiles.role`,
   `expeditions.region`, `research_assets.asset_type`,
   `generated_content.content_type/status`). Completed them using the
   values named elsewhere in the spec's prose (roles: admin/editor/
   researcher/visitor; regions: Arctic/Antarctic/Himalayas/Southern Ocean;
   asset types: report/dataset/publication/photo/video; editorial states:
   draft/peer_review/admin_approved/published, plus `rejected` since a
   review workflow needs a reject path).
2. **The original `/api/v1/process-document` endpoint had no
   authentication.** Since it triggers local LLM inference and writes to
   the database, it must be restricted to authenticated
   researcher/editor/admin users — added JWT verification against
   Supabase's project JWT secret.
3. **Immutability** ("immutability on scientific publication/dataset
   versions") is implemented as an `is_immutable` flag flipped on publish,
   enforced by a trigger that rejects further edits to the file/title/
   description of a flagged row. Un-publishing/versioning flows aren't
   specified, so they're out of scope until you confirm the desired
   behavior.
4. **Storage bucket** is assumed to be named `research-media`, matching
   the frontend's download links; create it in the Supabase dashboard
   (Storage → New bucket → public for public assets, or split into
   separate public/private buckets if you want stronger isolation than
   RLS-guarded metadata rows alone).
5. **RLS on `research_assets` SELECT** treats *any* authenticated user as
   able to read non-public rows in the original spec's policy
   (`auth.role() = 'authenticated'`). That looked unintentionally broad —
   any logged-in visitor could read every researcher's private drafts —
   so it's tightened to "public, or the uploader, or editor/admin."
   Flag if broader internal visibility was actually intended.
6. **Rate limiting** is in-memory and per-process, which is correct for
   the single-instance deployment the spec calls for, but won't hold up
   if you later run multiple backend replicas — swap for Redis at that
   point.

## Component inventory

| Component | Role |
|---|---|
| React + Vite frontend | Public portal, auth UI, editorial dashboard |
| Supabase Postgres | System of record: profiles, expeditions, assets, content, vectors, audit log |
| Supabase Storage | Binary files (reports, datasets, media) |
| Supabase Auth | Email/password auth, JWT issuance |
| FastAPI backend | PDF extraction + orchestration of local LLM calls |
| Ollama (local) | Text generation (llama3) and embeddings (nomic-embed-text) |

## Data flow

1. Researcher signs in (Supabase Auth) → uploads a file to Storage and a
   metadata row to `research_assets` directly from the frontend.
2. Frontend calls `POST /api/v1/process-document` with the file + asset_id
   and the user's Supabase JWT.
3. Backend verifies the JWT, extracts PDF text, sends it to local Ollama,
   parses the structured JSON response, writes `generated_content` rows
   (`status='draft'`) and `asset_vectors` rows via the Supabase
   service-role client (bypasses RLS deliberately, since the backend is a
   trusted service).
4. Editors move drafts through `draft → peer_review → admin_approved →
   published` from the Editorial Dashboard, each transition an RLS-gated
   `UPDATE` on `generated_content`.
5. Public visitors query `research_assets`/`generated_content` directly
   through Supabase's auto-generated REST API, filtered by RLS to public/
   published rows only — no backend involvement.

## Known limitations (be upfront, not silent, about these)

- No CI pipeline config included — add a GitHub Actions workflow that
  runs `pytest` (backend) and `npm run build`/`vitest` (frontend) before
  merging; the shape is straightforward but wasn't generated here since
  it depends on your git host and deploy target.
- The backend test suite mocks Ollama/Supabase for the shapes that matter
  (auth, validation) but doesn't include a live integration test against
  a real Supabase project — that needs a Supabase test project's
  credentials, which only you can provision.
- No E2E (Playwright/Cypress) tests yet — recommended next step once the
  UI is running against a real Supabase project.
- Social-media formatting (X/LinkedIn/Instagram variants mentioned in the
  functional requirements) is modeled in the schema
  (`content_type` includes `social_x`/`social_linkedin`/
  `social_instagram`) but the Ollama prompt currently only generates
  `summary` + `article`. Extending `generate_structured()` to also return
  per-platform variants is a small, mechanical follow-up.
- Spatial-tag search (mentioned as a non-functional requirement) isn't
  implemented — the schema has no geospatial column yet. If expeditions
  need map-based search, add a PostGIS `geography` column to
  `expeditions` and index it.
