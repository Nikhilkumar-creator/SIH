"""
Verifies the Supabase JWT sent by the frontend (Authorization: Bearer <token>)
so this backend never trusts an unauthenticated caller. The original spec's
draft endpoint had no auth check at all — this closes that gap.
"""
from fastapi import Header, HTTPException, status
import jwt
from config import settings

ALLOWED_ROLES_FOR_INGESTION = {"researcher", "editor", "admin"}


class CurrentUser:
    def __init__(self, user_id: str, role: str, email: str | None):
        self.user_id = user_id
        self.role = role
        self.email = email


def get_current_user(authorization: str = Header(default="")) -> CurrentUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    user_id = payload.get("sub")
    # app_metadata.role is synced from public.profiles by a Supabase trigger;
    # falling back to "visitor" fails closed rather than open.
    role = (payload.get("app_metadata") or {}).get("role", "visitor")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing subject")

    return CurrentUser(user_id=user_id, role=role, email=payload.get("email"))


def require_ingestion_role(user: CurrentUser) -> None:
    if user.role not in ALLOWED_ROLES_FOR_INGESTION:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Role '{user.role}' may not trigger document ingestion",
        )
