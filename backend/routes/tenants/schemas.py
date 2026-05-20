from typing import Optional

from pydantic import BaseModel


class TenantOut(BaseModel):
    hospital_id: str
    name: str
    subdomain: Optional[str] = None
    tenant_url: Optional[str] = None
    invite_code: Optional[str] = None
    plan: str = "free"
    max_users: int = 5
    max_scans_per_month: int = 100
    is_active: bool = True


class TenantPublicOut(BaseModel):
    """Safe-to-expose subset for the public subdomain lookup endpoint."""

    hospital_id: str
    name: str
    subdomain: str
    tenant_url: str
    is_active: bool


class TenantUpdateSchema(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    max_users: Optional[int] = None
    max_scans_per_month: Optional[int] = None
    is_active: Optional[bool] = None
