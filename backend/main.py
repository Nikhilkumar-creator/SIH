import logging
import time
from collections import defaultdict

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config import settings
from services import pdf_service, ollama_service
from services.auth_service import get_current_user, require_ingestion_role, CurrentUser
from services.supabase_client import supabase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("ncpor.backend")

app = FastAPI(title="NCPOR AI Media Processing Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- minimal in-memory rate limiter (per-user, per-minute) -----------------
# Adequate for a single-instance deployment as specified; swap for a
# Redis-backed limiter if this backend is ever horizontally scaled.
_RATE_LIMIT = 10  # requests / minute / user
_hits: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(user_id: str) -> None:
    now = time.time()
    window = [t for t in _hits[user_id] if now - t < 60]
    if len(window) >= _RATE_LIMIT:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limit exceeded")
    window.append(now)
    _hits[user_id] = window


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    detail = str(exc) if settings.ENV != "production" else "Internal server error"
    return JSONResponse(status_code=500, content={"error": detail})


@app.get("/health")
async def health():
    """Liveness/readiness probe. Also confirms Supabase reachability."""
    try:
        supabase.table("profiles").select("id").limit(1).execute()
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "supabase_reachable": db_ok}


class ProcessingResponse(BaseModel):
    asset_id: str
    status: str
    summary: str
    suggested_tags: list[str]
    generated_article: str


@app.post("/api/v1/process-document", response_model=ProcessingResponse)
async def process_document(
    asset_id: str = Form(...),
    file: UploadFile = File(...),
    user: CurrentUser = Depends(get_current_user),
):
    """
    Extracts text from an uploaded scientific report, runs it through the
    local Ollama model, and writes the resulting draft(s) into
    generated_content with status='draft' so they enter the editorial
    workflow (Draft -> Peer Review -> Admin Approval -> Published).
    """
    require_ingestion_role(user)
    _check_rate_limit(user.user_id)

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF documents are supported")

    # Confirm the asset exists and the caller is allowed to touch it before
    # doing any expensive work — never trust the asset_id blindly.
    asset = (
        supabase.table("research_assets")
        .select("id, uploaded_by")
        .eq("id", asset_id)
        .maybe_single()
        .execute()
    )
    if not asset.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown asset_id")
    if asset.data["uploaded_by"] != user.user_id and user.role not in ("editor", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your asset")

    extracted_text = pdf_service.extract_text(file)
    result = await ollama_service.generate_structured(extracted_text)

    rows = [
        {
            "asset_id": asset_id,
            "content_type": "summary",
            "body": result["summary"],
            "tags": result["tags"],
            "status": "draft",
        },
        {
            "asset_id": asset_id,
            "content_type": "article",
            "title": "Outreach Article Draft",
            "body": result["article"],
            "tags": result["tags"],
            "status": "draft",
        },
    ]
    insert_res = supabase.table("generated_content").insert(rows).execute()
    if not insert_res.data:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to persist drafts")

    # Chunk + embed for semantic search, stored separately from outreach drafts.
    for i, chunk in enumerate(pdf_service.chunk_text(extracted_text)):
        vector = await ollama_service.embed(chunk)
        supabase.table("asset_vectors").insert(
            {"asset_id": asset_id, "chunk_index": i, "chunk_content": chunk, "embedding": vector}
        ).execute()

    supabase.table("audit_log").insert(
        {
            "actor_id": user.user_id,
            "action": "process_document",
            "entity": "research_assets",
            "entity_id": asset_id,
        }
    ).execute()

    return ProcessingResponse(
        asset_id=asset_id,
        status="success",
        summary=result["summary"],
        suggested_tags=result["tags"],
        generated_article=result["article"],
    )
