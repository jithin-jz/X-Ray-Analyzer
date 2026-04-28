import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from config.errors import NotFoundException


async def create_scan(
    data: dict, user_email: str, tenant_db: AsyncIOMotorDatabase
) -> dict:
    scan_id = str(uuid.uuid4())
    doc = {
        "scan_id": scan_id,
        "patient_id": data["patient_id"],
        "scan_type": data.get("scan_type", "chest_xray"),
        "status": "uploaded",
        "image_path": None,
        "ai_result": None,
        "notes": data.get("notes"),
        "created_by": user_email,
        "reviewed_by": None,
        "created_at": datetime.now(timezone.utc),
    }
    await tenant_db.scans.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def list_scans(
    tenant_db: AsyncIOMotorDatabase, patient_id: str | None = None
) -> list[dict]:
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    cursor = tenant_db.scans.find(query, {"_id": 0})
    return await cursor.to_list(5000)


async def get_scan(scan_id: str, tenant_db: AsyncIOMotorDatabase) -> dict:
    scan = await tenant_db.scans.find_one({"scan_id": scan_id}, {"_id": 0})
    if not scan:
        raise NotFoundException("Scan")
    return scan


async def update_scan_status(
    scan_id: str, status: str, tenant_db: AsyncIOMotorDatabase
) -> dict:
    result = await tenant_db.scans.update_one(
        {"scan_id": scan_id}, {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise NotFoundException("Scan")
    return await get_scan(scan_id, tenant_db)


async def save_ai_result(
    scan_id: str, ai_result: dict, tenant_db: AsyncIOMotorDatabase
) -> dict:
    result = await tenant_db.scans.update_one(
        {"scan_id": scan_id},
        {"$set": {"ai_result": ai_result, "status": "analyzed"}},
    )
    if result.matched_count == 0:
        raise NotFoundException("Scan")
    return await get_scan(scan_id, tenant_db)


async def delete_scan(scan_id: str, tenant_db: AsyncIOMotorDatabase):
    result = await tenant_db.scans.delete_one({"scan_id": scan_id})
    if result.deleted_count == 0:
        raise NotFoundException("Scan")
