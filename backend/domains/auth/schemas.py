from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    role: str = "hospital"  # "hospital" or "doctor"
    hospital_name: Optional[str] = None  # required if role == "hospital"
    invite_code: Optional[str] = None  # required if role == "doctor"


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class VerifyOTPSchema(BaseModel):
    email: EmailStr
    otp: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr
    origin: str


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    has_passkey: bool = False
