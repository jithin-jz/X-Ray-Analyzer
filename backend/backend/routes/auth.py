from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from backend.database import get_db
from backend.schemas.user_schema import RegisterSchema, LoginSchema
import bcrypt
from backend.utils.jwt_utils import create_access_token
from backend.services.email_service import send_otp_email, send_magic_link_email
import random
import time

router = APIRouter()

# Simple in-memory stores (use Redis for production)
otp_store = {} # { "email": {"code": "123456", "expires": time.time() + 600} }

@router.post("/register")
async def register_user(data: RegisterSchema, background_tasks: BackgroundTasks, db=Depends(get_db)):
    
    user = await db.users.find_one({"email": data.email})
    if user and user.get("is_verified"):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    if not user:
        await db.users.insert_one({
            "email": data.email,
            "password": hashed_password,
            "is_verified": False,
            "credential_id": None,
            "public_key": None
        })
    else:
        # Update existing unverified user
        await db.users.update_one({"email": data.email}, {"$set": {"password": hashed_password}})

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    otp_store[data.email] = {
        "code": otp_code,
        "expires": time.time() + 600 # 10 mins
    }
    
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
    del otp_store[email]
    
    token = create_access_token({"sub": email})
    return {"message": "Registration complete", "token": token}


@router.post("/login")
async def login_user(data: LoginSchema, db=Depends(get_db)):

    user = await db.users.find_one({"email": data.email})

    # We do a basic check here. If they have a credential_id, they should be logging in with passkeys.
    if not user or not bcrypt.checkpw(data.password.encode('utf-8'), user["password"].encode('utf-8')):
        if user and user.get("credential_id"):
            raise HTTPException(status_code=401, detail="Account locked to Passkey. Click 'Sign In with Passkey' below.")
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Account not verified. Register again to receive OTP.")

    token = create_access_token({"sub": data.email})

    return {"message": "Login success", "token": token}

@router.post("/forgot-password")
async def forgot_password(email: str = Body(...), origin: str = Body(...), background_tasks: BackgroundTasks = None, db=Depends(get_db)):
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if user exists
        return {"message": "If the account exists, a magic link was sent."}
    
    # Generate a magic link token (valid for 15 mins) that signs their email. 
    # Use create_access_token natively.
    reset_token = create_access_token({"sub": email, "type": "magic_link"})
    
    # Send email
    if background_tasks:
        background_tasks.add_task(send_magic_link_email, email, reset_token, origin)
        
    return {"message": "If the account exists, a magic link was sent."}




