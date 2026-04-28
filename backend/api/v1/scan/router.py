from fastapi import APIRouter, Depends, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from core.dependencies import get_tenant_db, require_doctor
from api.v1.scan.schemas import ScanCreateSchema
from api.v1.scan.service import (
    create_scan,
    delete_scan,
    get_scan,
    list_scans,
)

router = APIRouter(prefix="/scans", tags=["Scans"])


@router.post("/")
async def create(
    data: ScanCreateSchema,
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    return await create_scan(data.model_dump(), user["email"], tenant_db)


@router.get("/")
async def list_all(
    patient_id: Optional[str] = Query(None),
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    return await list_scans(tenant_db, patient_id)


@router.get("/{scan_id}")
async def get_one(
    scan_id: str,
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    return await get_scan(scan_id, tenant_db)


@router.post("/{scan_id}/upload")
async def upload_image(
    scan_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    # TODO: Implement file storage (local/S3/MinIO)
    # For now, just update the scan with a placeholder path
    tenant_id = user["tenant_id"]
    image_path = f"uploads/{tenant_id}/{scan_id}/{file.filename}"

    await tenant_db.scans.update_one(
        {"scan_id": scan_id},
        {"$set": {"image_path": image_path, "status": "uploaded"}},
    )
    return {"message": "Image uploaded", "path": image_path}


@router.delete("/{scan_id}")
async def delete(
    scan_id: str,
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    await delete_scan(scan_id, tenant_db)
    return {"message": "Scan deleted"}
