from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    role: str = "hospital" # 'hospital' or 'doctor'
    hospital_name: Optional[str] = None # required if role == 'hospital'
    invite_code: Optional[str] = None # required if role == 'doctor'

class LoginSchema(BaseModel):
    email: EmailStr
    password: str
