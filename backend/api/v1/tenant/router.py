from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import get_master_db
from core.dependencies import get_current_user, require_admin, require_superadmin
from api.v1.tenant.schemas import TenantUpdateSchema
from api.v1.tenant.service import (
    deactivate_tenant,
    get_tenant,
    list_all_tenants,
    regenerate_invite_code,
    update_tenant,
)

router = APIRouter(prefix="/tenants", tags=["Tenant Management"])


@router.get("/")
async def list_tenants(
    user: dict = Depends(require_superadmin),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    """Superadmin: list all hospitals/tenants."""
    return await list_all_tenants(db)


@router.get("/mine")
async def get_my_tenant(
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    """Get the current user's tenant info."""
    if not user.get("tenant_id"):
        return {"detail": "No tenant associated"}
    return await get_tenant(user["tenant_id"], db)


@router.get("/{hospital_id}")
async def get_tenant_by_id(
    hospital_id: str,
    user: dict = Depends(require_superadmin),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    return await get_tenant(hospital_id, db)


@router.patch("/{hospital_id}")
async def update_tenant_route(
    hospital_id: str,
    data: TenantUpdateSchema,
    user: dict = Depends(require_superadmin),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    return await update_tenant(hospital_id, data.model_dump(exclude_none=True), db)


@router.post("/{hospital_id}/regenerate-invite")
async def regenerate_invite(
    hospital_id: str,
    user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    new_code = await regenerate_invite_code(hospital_id, db)
    return {"invite_code": new_code}


@router.delete("/{hospital_id}")
async def deactivate(
    hospital_id: str,
    user: dict = Depends(require_superadmin),
    db: AsyncIOMotorDatabase = Depends(get_master_db),
):
    await deactivate_tenant(hospital_id, db)
    return {"message": "Tenant deactivated"}
