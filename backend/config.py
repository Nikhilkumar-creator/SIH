"""
Centralized configuration. All values come from environment variables —
never hardcode secrets. See .env.example for the full list.
"""
import os
from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Copy .env.example to .env and fill it in."
        )
    return value


class Settings:
    # Supabase — the SERVICE ROLE key is used only here, server-side, and
    # must never be shipped to the frontend (which uses the anon key).
    SUPABASE_URL: str = _require("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = _require("SUPABASE_SERVICE_ROLE_KEY")

    # Ollama
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"))

    # App
    ENV: str = os.getenv("ENV", "development")
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "50"))
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # Auth: the backend verifies the caller's Supabase JWT itself rather
    # than trusting the client, so it needs the project's JWT secret.
    SUPABASE_JWT_SECRET: str = _require("SUPABASE_JWT_SECRET")


settings = Settings()
