"""
Authentication business logic — register, login, OTP, refresh.
"""

import random
import uuid

from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import setup_tenant_database
from core.exceptions import BadRequestException, ConflictException, NotAuthenticatedException
from core.redis_client import delete_otp, get_otp, set_otp
from core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)


async def register_user(
    email: str,
    password: str,
    role: str,
    hospital_name: str | None,
    invite_code: str | None,
    db: AsyncIOMotorDatabase,
) -> str:
    """
    Register a new user (hospital admin or doctor).
    Returns the OTP code to send via email.
    """
    existing = await db.users.find_one({"email": email})
    if existing and existing.get("is_verified"):
        raise ConflictException("User already exists. Please login.")

    hashed = hash_password(password)
    hospital_id = None
    effective_role = role

    if role == "hospital":
        # New hospital registration
        if not hospital_name:
            raise BadRequestException("Hospital name is required.")

        hospital_id = str(uuid.uuid4())
        invite = str(uuid.uuid4())[:8].upper()

        # Create the hospital's own database with collections + indexes
        await setup_tenant_database(hospital_id)

        # Register the hospital in the public database
        await db.hospitals.insert_one({
            "hospital_id": hospital_id,
            "name": hospital_name,
            "invite_code": invite,
            "plan": "free",
            "max_users": 5,
            "max_scans_per_month": 100,
            "is_active": True,
        })
        effective_role = "admin"

    elif role == "doctor":
        # Doctor joining an existing hospital
        if not invite_code:
            raise BadRequestException("Invite code is required.")
        hospital = await db.hospitals.find_one({"invite_code": invite_code})
        if not hospital:
            raise BadRequestException("Invalid invite code.")
        hospital_id = hospital["hospital_id"]
        effective_role = "doctor"

    # Create or update user
    if not existing:
        await db.users.insert_one({
            "email": email,
            "password": hashed,
            "is_verified": False,
            "credential_id": None,
            "public_key": None,
            "role": effective_role,
            "hospital_id": hospital_id,
        })
    else:
        await db.users.update_one(
            {"email": email},
            {"$set": {"password": hashed, "role": effective_role, "hospital_id": hospital_id}},
        )

    # Generate and store OTP
    otp_code = str(random.randint(100000, 999999))
    set_otp(email, otp_code)
    return otp_code


async def verify_otp_and_activate(email: str, otp: str, db: AsyncIOMotorDatabase) -> dict:
    """Verify OTP, activate user, return tokens."""
    stored = get_otp(email)
    if not stored:
        raise BadRequestException("OTP expired or invalid")
    if stored != otp:
        raise BadRequestException("Incorrect OTP")

    await db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
    user = await db.users.find_one({"email": email})
    delete_otp(email)

    token_data = {"sub": email, "role": user.get("role"), "hospital_id": user.get("hospital_id")}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "has_passkey": bool(user.get("credential_id")),
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

    token_data = {"sub": email, "role": user.get("role"), "hospital_id": user.get("hospital_id")}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "has_passkey": bool(user.get("credential_id")),
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

    token_data = {"sub": email, "role": user.get("role"), "hospital_id": user.get("hospital_id")}
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
            if user["role"] in ("admin", "superadmin"):
                response["invite_code"] = hospital.get("invite_code")

    return response
