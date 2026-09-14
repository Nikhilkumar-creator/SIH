# API Contracts

## Supabase Auto-APIs (primary data path)

The frontend talks to Supabase directly via `@supabase/supabase-js` for all
CRUD that RLS can safely gate: `profiles`, `expeditions`, `research_assets`,
`generated_content` (read/status-transition), and Storage uploads. There is
no bespoke CRUD backend for these — that would duplicate what Supabase's
PostgREST layer already does correctly, and the spec calls for avoiding
unnecessary services.

Key policies (see `database/migrations/001_init.sql` for the full set):

| Table | Public (anon) | Owner (researcher) | Editor | Admin |
|---|---|---|---|---|
| research_assets | SELECT where `is_public=true` | SELECT/INSERT/UPDATE own | SELECT/UPDATE all | full |
| generated_content | SELECT where `status='published'` | SELECT own asset's drafts | SELECT/UPDATE all | full |
| asset_vectors | none | none | SELECT | full |
| audit_log | none | none | none | SELECT |

## Backend Endpoints (FastAPI — AI ingestion only)

### `GET /health`
- Auth: none
- Response 200: `{ "status": "ok"|"degraded", "supabase_reachable": bool }`

### `POST /api/v1/process-document`
- Auth: **required** — `Authorization: Bearer <supabase-jwt>`
- Authorization: caller must be `researcher`, `editor`, or `admin`, and
  must own the target asset (editors/admins exempt from ownership check).
- Rate limit: 10 requests/minute/user.
- Request: `multipart/form-data`
  - `asset_id` (string, required) — UUID of an existing `research_assets` row
  - `file` (file, required) — PDF, extracted server-side, max 25 pages read
- Response 200:
  ```json
  {
    "asset_id": "uuid",
    "status": "success",
    "summary": "string",
    "suggested_tags": ["string"],
    "generated_article": "string"
  }
  ```
- Error responses:
  | Status | Meaning |
  |---|---|
  | 400 | Not a PDF, or PDF has no extractable text (scanned image) |
  | 401 | Missing/invalid/expired JWT |
  | 403 | Role not permitted, or caller doesn't own the asset |
  | 404 | `asset_id` does not exist |
  | 429 | Rate limit exceeded |
  | 502 | Ollama returned an error or malformed JSON |
  | 503 | Ollama is unreachable |

Side effects on success: inserts two `generated_content` rows
(`content_type='summary'` and `'article'`, `status='draft'`), inserts one
`asset_vectors` row per text chunk, and one `audit_log` row.
