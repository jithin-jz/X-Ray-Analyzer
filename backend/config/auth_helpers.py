from fastapi import Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from config.database import get_master_db, get_tenant_database
from config.errors import (
    ForbiddenException,
    InvalidTokenException,
    NotAuthenticatedException,
    TenantNotFoundException,
)
from config.password_tokens import verify_token


# ── Helpers ──────────────────────────────────────────────────────────────────

def _extract_bearer_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise NotAuthenticatedException()
    return auth_header.split(" ", 1)[1]


# ── Current User ─────────────────────────────────────────────────────────────

async def get_current_user(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_master_db),
) -> dict:
    """
    Core dependency — extracts JWT, validates it, and returns the full
    user context dict used by all downstream dependencies and routes.
    """
    token = _extract_bearer_token(request)
    payload = verify_token(token)
    if not payload:
        raise InvalidTokenException()

    email = payload.get("sub")
    if not email:
        raise InvalidTokenException("Token missing subject")

    user = await db.users.find_one({"email": email})
    if not user:
        raise InvalidTokenException("User no longer exists")

    return {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "doctor"),
        "tenant_id": user.get("hospital_id"),
        "is_verified": user.get("is_verified", False),
        "has_passkey": bool(user.get("credential_id")),
    }


# ── Tenant DB ────────────────────────────────────────────────────────────────

async def get_tenant_db(
    user: dict = Depends(get_current_user),
) -> AsyncIOMotorDatabase:
    """
    Returns the isolated MongoDB database for the current user's tenant.
    All patient/scan/report routes should depend on this.
    """
    tenant_id = user.get("tenant_id")
    if not tenant_id:
        raise TenantNotFoundException()
    return get_tenant_database(tenant_id)


# ── Role-Based Access Control ────────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """
    Returns a FastAPI dependency that enforces role-based access.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin", "superadmin"))])
        async def admin_route(...): ...

    Or as a parameter:
        async def route(user: dict = Depends(require_role("admin"))): ...
    """

    async def _checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in allowed_roles:
            raise ForbiddenException(
                f"Role '{user['role']}' is not allowed. Required: {', '.join(allowed_roles)}"
            )
        return user

    return _checker


# ── Convenience shortcuts ────────────────────────────────────────────────────

require_superadmin = require_role("superadmin")
require_admin = require_role("admin", "superadmin")
require_doctor = require_role("doctor", "admin", "superadmin")
require_any_authenticated = require_role("doctor", "admin", "superadmin", "radiologist")
