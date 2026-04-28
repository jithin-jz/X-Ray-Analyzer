import random
import time
import uuid

import bcrypt
from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Request

from backend.database import get_master_db
from backend.schemas.user_schema import LoginSchema, RegisterSchema
from backend.services.email_service import send_magic_link_email, send_otp_email
from backend.utils.jwt_utils import create_access_token, verify_token
from backend.redis_client import set_otp, get_otp, delete_otp

router = APIRouter()

# Simple in-memory stores replaced with Redis


@router.post("/register")
async def register_user(
    data: RegisterSchema, background_tasks: BackgroundTasks, db=Depends(get_master_db)
):

    user = await db.users.find_one({"email": data.email})
    if user and user.get("is_verified"):
        raise HTTPException(
            status_code=400, detail="User already exists with this email. Please login."
        )

    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    hospital_id = None
    role = data.role
    
    if data.role == "hospital":
        if not data.hospital_name:
            raise HTTPException(status_code=400, detail="Hospital name is required.")
        hospital_id = str(uuid.uuid4())
        invite_code = str(uuid.uuid4())[:8].upper()
        # Register the hospital
        await db.hospitals.insert_one({
            "hospital_id": hospital_id,
            "name": data.hospital_name,
            "invite_code": invite_code
        })
        role = "admin"
    elif data.role == "doctor":
        if not data.invite_code:
            raise HTTPException(status_code=400, detail="Invite code is required.")
        hospital = await db.hospitals.find_one({"invite_code": data.invite_code})
        if not hospital:
            raise HTTPException(status_code=400, detail="Invalid invite code.")
        hospital_id = hospital["hospital_id"]
        role = "doctor"

    if not user:
        await db.users.insert_one(
            {
                "email": data.email,
                "password": hashed_password,
                "is_verified": False,
                "credential_id": None,
                "public_key": None,
                "role": role,
                "hospital_id": hospital_id
            }
        )
    else:
        # Update existing unverified user
        await db.users.update_one(
            {"email": data.email}, {"$set": {"password": hashed_password, "role": role, "hospital_id": hospital_id}}
        )

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    set_otp(data.email, otp_code)  # Defaults to 10 mins TTL

    # Send email in background
    background_tasks.add_task(send_otp_email, data.email, otp_code)

    return {"message": "OTP sent to email. Pending verification."}


@router.post("/verify-otp")
async def verify_otp(email: str = Body(...), otp: str = Body(...), db=Depends(get_master_db)):
    stored_code = get_otp(email)

    if not stored_code:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")

    if stored_code != otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP")

    # Valid! Update user
    await db.users.update_one({"email": email}, {"$set": {"is_verified": True}})

    # Check if they already have a passkey (possible on recovery/re-registration)
    user = await db.users.find_one({"email": email})
    has_passkey = bool(user.get("credential_id"))

    delete_otp(email)

    token = create_access_token({
        "sub": email,
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id")
    })
    return {
        "message": "Registration complete",
        "token": token,
        "has_passkey": has_passkey,
    }


@router.post("/login")
async def login_user(data: LoginSchema, db=Depends(get_master_db)):

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

    token = create_access_token({
        "sub": data.email,
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id")
    })
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
    db=Depends(get_master_db),
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


@router.get("/me")
async def get_current_user_info(request: Request, db=Depends(get_master_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    decoded = verify_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    email = decoded.get("sub")
    role = decoded.get("role")
    hospital_id = decoded.get("hospital_id")
    
    response = {"email": email, "role": role, "hospital_id": hospital_id}
    
    if hospital_id:
        hospital = await db.hospitals.find_one({"hospital_id": hospital_id})
        if hospital:
            response["hospital_name"] = hospital.get("name")
            if role == "admin":
                response["invite_code"] = hospital.get("invite_code")
            
    return response


@router.get("/dashboard-data")
async def get_dashboard_data(request: Request, db=Depends(get_master_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    decoded = verify_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    role = decoded.get("role")
    hospital_id = decoded.get("hospital_id")
    
    if role == "superadmin":
        hospitals_cursor = db.hospitals.find({})
        hospitals = await hospitals_cursor.to_list(1000)
        users_count = await db.users.count_documents({})
        return {
            "type": "superadmin",
            "hospitals": [{"id": h.get("hospital_id"), "name": h.get("name"), "invite_code": h.get("invite_code")} for h in hospitals],
            "total_users": users_count
        }
    elif role == "admin":
        doctors_cursor = db.users.find({"hospital_id": hospital_id, "role": "doctor"})
        doctors = await doctors_cursor.to_list(1000)
        return {
            "type": "admin",
            "roster": [{"email": d["email"], "is_verified": d.get("is_verified", False), "has_passkey": bool(d.get("credential_id"))} for d in doctors]
        }
    else:
        return {"type": "doctor", "message": "Ready to scan"}
