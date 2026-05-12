from pydantic import BaseModel
from typing import Optional


class TenantOut(BaseModel):
    hospital_id: str
    name: str
    invite_code: str
    plan: str = "free"
    max_users: int = 5
    max_scans_per_month: int = 100
    is_active: bool = True


class TenantUpdateSchema(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    max_users: Optional[int] = None
    max_scans_per_month: Optional[int] = None
    is_active: Optional[bool] = None
