"""
Authentication business logic — register, login, OTP, refresh.
"""

import random
import uuid

from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import setup_tenant_database
from core.exceptions import (
    BadRequestException,
    ConflictException,
    NotAuthenticatedException,
)
from core.redis_client import delete_otp, get_otp, set_otp
from core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)
from core.tenancy import build_tenant_url, is_reserved, slugify

# Subdomain generation
_FALLBACK_SLUG = "hospital"
_MAX_SUFFIX_TRIES = 50


async def _generate_unique_subdomain(
    hospital_name: str, db: AsyncIOMotorDatabase
) -> str:
    """
    Derive a DNS-safe slug from `hospital_name`, append a numeric suffix until
    it is globally unique across the hospitals collection and not reserved.
    """
    base = slugify(hospital_name) or _FALLBACK_SLUG

    # Fall back if the slug ended up empty or reserved
    if not base or is_reserved(base):
        base = f"{_FALLBACK_SLUG}-{uuid.uuid4().hex[:6]}"

    candidate = base
    for n in range(2, _MAX_SUFFIX_TRIES + 2):
        existing = await db.hospitals.find_one({"subdomain": candidate})
        if not existing and not is_reserved(candidate):
            return candidate
        candidate = f"{base}-{n}"

    # Extremely unlikely fallback: append a short uuid
    return f"{base}-{uuid.uuid4().hex[:6]}"


async def register_user(
    email: str,
    password: str,
    role: str,
    hospital_name: str | None,
    invite_code: str | None,
    db: AsyncIOMotorDatabase,
) -> dict:
    """
    Register a new user (hospital admin or doctor).
    Returns a dict with the OTP code (to email) plus tenant info if a new
    hospital was created.
    """
    existing = await db.users.find_one({"email": email})
    if existing and existing.get("is_verified"):
        raise ConflictException("User already exists. Please login.")

    hashed = hash_password(password)
    hospital_id: str | None = None
    subdomain: str | None = None
    tenant_url: str | None = None
    effective_role = role

    if role == "hospital":
        # New hospital registration
        if not hospital_name:
            raise BadRequestException("Hospital name is required.")

        hospital_id = str(uuid.uuid4())
        invite = str(uuid.uuid4())[:8].upper()
        subdomain = await _generate_unique_subdomain(hospital_name, db)
        tenant_url = build_tenant_url(subdomain)

        # Create the hospital's own database with collections + indexes
        await setup_tenant_database(hospital_id)

        # Register the hospital in the public database
        await db.hospitals.insert_one(
            {
                "hospital_id": hospital_id,
                "name": hospital_name,
                "subdomain": subdomain,
                "invite_code": invite,
                "plan": "free",
                "max_users": 5,
                "max_scans_per_month": 100,
                "is_active": True,
            }
        )
        effective_role = "admin"

    elif role == "doctor":
        # Doctor joining an existing hospital
        if not invite_code:
            raise BadRequestException("Invite code is required.")
        hospital = await db.hospitals.find_one({"invite_code": invite_code})
        if not hospital:
            raise BadRequestException("Invalid invite code.")
        hospital_id = hospital["hospital_id"]
        subdomain = hospital.get("subdomain")
        if subdomain:
            tenant_url = build_tenant_url(subdomain)
        effective_role = "doctor"

    # Create or update user
    if not existing:
        await db.users.insert_one(
            {
                "email": email,
                "password": hashed,
                "is_verified": False,
                "credential_id": None,
                "public_key": None,
                "role": effective_role,
                "hospital_id": hospital_id,
            }
        )
    else:
        await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "password": hashed,
                    "role": effective_role,
                    "hospital_id": hospital_id,
                }
            },
        )

    # Generate and store OTP
    otp_code = str(random.randint(100000, 999999))
    set_otp(email, otp_code)

    return {
        "otp_code": otp_code,
        "subdomain": subdomain,
        "tenant_url": tenant_url,
        "hospital_id": hospital_id,
    }


async def verify_otp_and_activate(
    email: str, otp: str, db: AsyncIOMotorDatabase
) -> dict:
    """Verify OTP, activate user, return tokens."""
    stored = get_otp(email)
    if not stored:
        raise BadRequestException("OTP expired or invalid")
    if stored != otp:
        raise BadRequestException("Incorrect OTP")

    await db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
    user = await db.users.find_one({"email": email})
    delete_otp(email)

    # Look up tenant subdomain for redirect after verification.
    subdomain = None
    tenant_url = None
    hospital_id = user.get("hospital_id")
    if hospital_id:
        hospital = await db.hospitals.find_one({"hospital_id": hospital_id})
        if hospital:
            subdomain = hospital.get("subdomain")
            if subdomain:
                tenant_url = build_tenant_url(subdomain)

    token_data = {
        "sub": email,
        "role": user.get("role"),
        "hospital_id": hospital_id,
    }
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "has_passkey": bool(user.get("credential_id")),
        "subdomain": subdomain,
        "tenant_url": tenant_url,
    }


async def login_user(email: str, password: str, db: AsyncIOMotorDatabase) -> dict:
    """Password-based login."""
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):
        if user and user.get("credential_id"):
            raise NotAuthenticatedException("Account uses Passkey only.")
        raise NotAuthenticatedException("Invalid credentials")

    if not user.get("is_verified"):
        raise BadRequestException("Account not verified. Register again to get OTP.")

    subdomain = None
    tenant_url = None
    hospital_id = user.get("hospital_id")
    if hospital_id:
        hospital = await db.hospitals.find_one({"hospital_id": hospital_id})
        if hospital:
            subdomain = hospital.get("subdomain")
            if subdomain:
                tenant_url = build_tenant_url(subdomain)

    token_data = {
        "sub": email,
        "role": user.get("role"),
        "hospital_id": hospital_id,
    }
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "has_passkey": bool(user.get("credential_id")),
        "subdomain": subdomain,
        "tenant_url": tenant_url,
    }


async def refresh_access_token(refresh_token: str, db: AsyncIOMotorDatabase) -> dict:
    """Issue new tokens from a valid refresh token."""
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise NotAuthenticatedException("Invalid refresh token")

    email = payload.get("sub")
    user = await db.users.find_one({"email": email})
    if not user:
        raise NotAuthenticatedException("User not found")

    token_data = {
        "sub": email,
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id"),
    }
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
    }


async def get_user_profile(user: dict, db: AsyncIOMotorDatabase) -> dict:
    """Get current user's profile with hospital info."""
    response = {
        "email": user["email"],
        "role": user["role"],
        "hospital_id": user.get("tenant_id"),
    }

    if user.get("tenant_id"):
        hospital = await db.hospitals.find_one({"hospital_id": user["tenant_id"]})
        if hospital:
            response["hospital_name"] = hospital.get("name")
            response["subdomain"] = hospital.get("subdomain")
            if hospital.get("subdomain"):
                response["tenant_url"] = build_tenant_url(hospital["subdomain"])
            if user["role"] in ("admin", "superadmin"):
                response["invite_code"] = hospital.get("invite_code")

    return response
