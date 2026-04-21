import random
import time

import bcrypt
from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException

from backend.database import get_db
from backend.schemas.user_schema import LoginSchema, RegisterSchema
from backend.services.email_service import send_magic_link_email, send_otp_email
from backend.utils.jwt_utils import create_access_token

router = APIRouter()

# Simple in-memory stores (use Redis for production)
otp_store = {}  # { "email": {"code": "123456", "expires": time.time() + 600} }


@router.post("/register")
async def register_user(
    data: RegisterSchema, background_tasks: BackgroundTasks, db=Depends(get_db)
):

    user = await db.users.find_one({"email": data.email})
    if user and user.get("is_verified"):
        raise HTTPException(
            status_code=400, detail="User already exists with this email. Please login."
        )

    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    if not user:
        await db.users.insert_one(
            {
                "email": data.email,
                "password": hashed_password,
                "is_verified": False,
                "credential_id": None,
                "public_key": None,
            }
        )
    else:
        # Update existing unverified user
        await db.users.update_one(
            {"email": data.email}, {"$set": {"password": hashed_password}}
        )

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    otp_store[data.email] = {"code": otp_code, "expires": time.time() + 600}  # 10 mins

    # Send email in background
    background_tasks.add_task(send_otp_email, data.email, otp_code)

    return {"message": "OTP sent to email. Pending verification."}


@router.post("/verify-otp")
async def verify_otp(email: str = Body(...), otp: str = Body(...), db=Depends(get_db)):
    record = otp_store.get(email)

    if not record or record["expires"] < time.time():
        raise HTTPException(status_code=400, detail="OTP expired or invalid")

    if record["code"] != otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP")

    # Valid! Update user
    await db.users.update_one({"email": email}, {"$set": {"is_verified": True}})

    # Check if they already have a passkey (possible on recovery/re-registration)
    user = await db.users.find_one({"email": email})
    has_passkey = bool(user.get("credential_id"))

    del otp_store[email]

    token = create_access_token({"sub": email})
    return {
        "message": "Registration complete",
        "token": token,
        "has_passkey": has_passkey,
    }


@router.post("/login")
async def login_user(data: LoginSchema, db=Depends(get_db)):

    user = await db.users.find_one({"email": data.email})

    # We do a basic check here. If they have a credential_id,
    # they should be logging in with passkeys.
    if not user or not bcrypt.checkpw(
        data.password.encode("utf-8"), user["password"].encode("utf-8")
    ):
        if user and user.get("credential_id"):
            raise HTTPException(
                status_code=401,
                detail="Account locked to Passkey. Click 'Sign In with Passkey' below.",
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Account not verified. Register again to receive OTP.",
        )

    token = create_access_token({"sub": data.email})
    has_passkey = bool(user.get("credential_id"))

    return {"message": "Login success", "token": token, "has_passkey": has_passkey}


@router.post("/logout")
async def logout():
    """
    Handles user logout. Since we use JWT, the client is responsible for
    discarding the token. This endpoint can be used to clear any HTTP-only cookies
    if implemented in the future.
    """
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(
    email: str = Body(...),
    origin: str = Body(...),
    background_tasks: BackgroundTasks = None,
    db=Depends(get_db),
):
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if user exists
        return {
            "message": "If the account exists, a updation link was sent to this mail."
        }

    # Generate a magic link token (valid for 15 mins) that signs their email.
    # Use create_access_token natively.
    reset_token = create_access_token({"sub": email, "type": "magic_link"})

    # Send email
    if background_tasks:
        background_tasks.add_task(send_magic_link_email, email, reset_token, origin)

    return {"message": "If the account exists, a updation link was sent to this mail."}
