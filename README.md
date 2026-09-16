# NCPOR Polar Science Outreach Portal

A knowledge-repository and AI-assisted outreach portal built on React +
Vite (frontend), Supabase (Postgres + Storage + Auth + RLS), and a local
FastAPI + Ollama service for document ingestion and content generation.
See `docs/ARCHITECTURE.md` for design decisions, assumptions, and known
limitations, and `docs/API.md` for the full API contract.

## Repository structure

```
ncpor-portal/
├── database/
│   └── migrations/001_init.sql   # schema, indexes, RLS policies
├── backend/                      # FastAPI ingestion service
│   ├── main.py
│   ├── config.py
│   ├── services/
│   │   ├── auth_service.py       # Supabase JWT verification
│   │   ├── pdf_service.py        # text extraction + chunking
│   │   ├── ollama_service.py     # local LLM generation + embeddings
│   │   └── supabase_client.py
│   └── tests/
├── frontend/                     # React + Vite portal
│   └── src/{pages,components,lib,types}/
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
└── .env.example
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- A Supabase project (hosted or self-hosted)
- [Ollama](https://ollama.com) installed locally, with `llama3` and
  `nomic-embed-text` pulled

## 1. Database setup

1. Create a Supabase project.
2. In the SQL editor, run `database/migrations/001_init.sql`.
3. In Storage, create a bucket named `research-media` (public, or private
   if you'd rather serve files through signed URLs — the frontend's
   download link assumes a public bucket).

## 2. Environment variables

Copy `.env.example` to `.env` at the repo root, and also to
`backend/.env` (the backend loads its own `.env` via `python-dotenv`).

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `SUPABASE_URL` | yes | Project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (backend) | Server-side writes, bypasses RLS | `eyJ...` |
| `SUPABASE_JWT_SECRET` | yes (backend) | Verifies frontend-issued JWTs | Project Settings → API |
| `VITE_SUPABASE_URL` | yes (frontend) | Same project URL, exposed to browser | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | yes (frontend) | Public anon key, RLS-restricted | `eyJ...` |
| `OLLAMA_HOST` | no | Local Ollama server | `http://localhost:11434` |
| `OLLAMA_MODEL` | no | Generation model | `llama3` |
| `OLLAMA_EMBED_MODEL` | no | Embedding model | `nomic-embed-text` |
| `CORS_ORIGINS` | no | Allowed frontend origin(s) | `http://localhost:5173` |
| `ENV` | no | `development`/`test`/`production` | `development` |

Never commit a filled-in `.env`.

## 3. Run locally

```bash
# Ollama (separate terminal)
ollama pull llama3
ollama pull nomic-embed-text
ollama serve

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## 4. Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run lint && npm run build
```

## 5. Deployment guidance

- **Frontend**: static build (`npm run build`) deployable to any static
  host (Netlify, Vercel, or NCPOR's own web server) — it's pure client-side
  JS talking to Supabase.
- **Backend + Ollama**: must run on infrastructure NCPOR controls (a lab
  server or on-prem VM), since Ollama needs real compute and the whole
  point of this design is that inference never leaves NCPOR's network.
  A single systemd service running `uvicorn` behind a reverse proxy
  (nginx/Caddy) is sufficient — no Kubernetes required, matching the
  spec's "operational simplicity" requirement.
- **Database**: hosted Supabase, or self-hosted Supabase (Docker Compose,
  provided by Supabase's own repo) if full on-prem is required.

## Important note on this build

This scaffold was generated and validated for logical/structural
correctness (schema constraints, RLS policy coverage, auth flow, request/
response contracts) but **has not been run against a live Supabase
project or a live Ollama instance** — that requires your actual project
credentials and a machine with a GPU/CPU capable of running llama3, which
this generation environment doesn't have. Before your first real upload,
run the "1–3" setup steps above and exercise `POST /api/v1/process-document`
against a real PDF to confirm the Ollama prompt's JSON output parses
cleanly for your chosen model — the prompt is written for strict JSON but
some smaller models drift from format instructions.
