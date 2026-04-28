from pydantic import BaseModel, EmailStr
from typing import Optional


class UserOut(BaseModel):
    email: EmailStr
    role: str
    is_verified: bool
    has_passkey: bool
    hospital_id: Optional[str] = None


class UserUpdateSchema(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
