import json

from fastapi import APIRouter, Body, Depends, HTTPException
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers.structs import PublicKeyCredentialDescriptor

from backend.database import get_master_db
from backend.services.webauthn_service import ORIGIN, RP_ID, RP_NAME
from backend.utils.jwt_utils import create_access_token
from backend.redis_client import set_challenge, get_challenge, delete_challenge

router = APIRouter()


# 🟡 STEP 1: Start Passkey Registration
@router.post("/passkey/register/start")
async def passkey_register_start(email: str, db=Depends(get_master_db)):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found. Register with password first."
        )

    options = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=email.encode("utf-8"),
        user_name=email,
        user_display_name=email,
    )

    set_challenge(email, options.challenge)

    return json.loads(options_to_json(options))


# 🟢 STEP 2: Verify Passkey Registration
@router.post("/passkey/register/verify")
async def passkey_register_verify(
    email: str, response: dict = Body(...), db=Depends(get_master_db)
):
    expected_challenge = get_challenge(email)
    if not expected_challenge:
        raise HTTPException(status_code=400, detail="No active challenge")

    try:
        verification = verify_registration_response(
            credential=response,
            expected_challenge=expected_challenge,
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Master Lock: Scramble the old password safely so it can't be used anymore!
    import secrets

    import bcrypt

    random_master_key = secrets.token_hex(64)  # 128 chars
    scrambled_password = bcrypt.hashpw(
        random_master_key.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "credential_id": verification.credential_id.hex(),
                "public_key": verification.credential_public_key.hex(),
                "password": scrambled_password,
            }
        },
    )

    delete_challenge(email)

    user = await db.users.find_one({"email": email})
    token = create_access_token({
        "sub": email,
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id")
    })
    return {"message": "Passkey registered successfully", "token": token}


# 🟡 STEP 3: Start Login
@router.post("/passkey/login/start")
async def passkey_login_start(email: str, db=Depends(get_master_db)):
    user = await db.users.find_one({"email": email})
    if not user or not user.get("credential_id"):
        raise HTTPException(status_code=400, detail="No passkey found")

    options = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[
            PublicKeyCredentialDescriptor(id=bytes.fromhex(user["credential_id"]))
        ],
    )

    set_challenge(email, options.challenge)

    return json.loads(options_to_json(options))


# 🟢 STEP 4: Verify Login
@router.post("/passkey/login/verify")
async def passkey_login_verify(
    email: str, response: dict = Body(...), db=Depends(get_master_db)
):
    user = await db.users.find_one({"email": email})
    if not user or not user.get("credential_id"):
        raise HTTPException(status_code=400, detail="No passkey found")

    expected_challenge = get_challenge(email)
    if not expected_challenge:
        raise HTTPException(status_code=400, detail="No active challenge")

    try:
        verify_authentication_response(
            credential=response,
            expected_challenge=expected_challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
            credential_public_key=bytes.fromhex(user["public_key"]),
            credential_current_sign_count=0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    delete_challenge(email)

    token = create_access_token({
        "sub": email,
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id")
    })
    return {"message": "Passkey login success", "token": token}
