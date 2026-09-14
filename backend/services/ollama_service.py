"""Wraps the local Ollama REST API. No cloud LLM calls anywhere in this
service — keeps the zero-cloud-lock-in requirement literally true."""
import json
import httpx
from fastapi import HTTPException, status
from config import settings


class OllamaUnavailable(Exception):
    pass


async def _post(path: str, payload: dict) -> dict:
    url = f"{settings.OLLAMA_HOST}{path}"
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.ConnectError as exc:
        raise OllamaUnavailable(
            f"Cannot reach local Ollama at {settings.OLLAMA_HOST}. "
            f"Is `ollama serve` running?"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Ollama returned {exc.response.status_code}: {exc.response.text[:300]}",
        ) from exc


async def generate_structured(report_text: str) -> dict:
    """
    Single prompt asking the model for strict JSON, instead of three
    separate calls glued together with string-splitting (the original
    draft's tag parsing broke on any comma inside a keyword phrase).
    """
    prompt = f"""You are drafting public outreach content from a polar
research report. Respond with ONLY minified JSON, no markdown fences, in
exactly this shape:
{{"summary": "<3 bullet points as one string, separated by \\n>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "article": "<~200 word public outreach article>"}}

REPORT TEXT (truncated):
{report_text[:6000]}
"""
    try:
        data = await _post(
            "/api/generate",
            {"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False},
        )
    except OllamaUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc

    raw = data.get("response", "").strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # Fail loudly rather than silently returning garbage as "content".
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Model did not return valid JSON; try again or check the "
            "OLLAMA_MODEL prompt-following quality.",
        )

    for key in ("summary", "tags", "article"):
        if key not in parsed:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY, f"Model response missing '{key}'"
            )
    return parsed


async def embed(text: str) -> list[float]:
    try:
        data = await _post(
            "/api/embeddings",
            {"model": settings.OLLAMA_EMBED_MODEL, "prompt": text},
        )
    except OllamaUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc

    embedding = data.get("embedding")
    if not embedding:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Empty embedding returned")
    return embedding
