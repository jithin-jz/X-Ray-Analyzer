import uuid

from motor.motor_asyncio import AsyncIOMotorDatabase

from config.errors import BadRequestException, NotFoundException


async def list_all_tenants(db: AsyncIOMotorDatabase) -> list[dict]:
    """Superadmin: list all hospitals."""
    cursor = db.hospitals.find({})
    hospitals = await cursor.to_list(1000)
    return [
        {
            "hospital_id": h.get("hospital_id"),
            "name": h.get("name"),
            "invite_code": h.get("invite_code"),
            "plan": h.get("plan", "free"),
            "max_users": h.get("max_users", 5),
            "max_scans_per_month": h.get("max_scans_per_month", 100),
            "is_active": h.get("is_active", True),
        }
        for h in hospitals
    ]


async def get_tenant(hospital_id: str, db: AsyncIOMotorDatabase) -> dict:
    hospital = await db.hospitals.find_one({"hospital_id": hospital_id})
    if not hospital:
        raise NotFoundException("Hospital")
    return {
        "hospital_id": hospital["hospital_id"],
        "name": hospital["name"],
        "invite_code": hospital.get("invite_code"),
        "plan": hospital.get("plan", "free"),
        "max_users": hospital.get("max_users", 5),
        "max_scans_per_month": hospital.get("max_scans_per_month", 100),
        "is_active": hospital.get("is_active", True),
    }


async def update_tenant(
    hospital_id: str, updates: dict, db: AsyncIOMotorDatabase
) -> dict:
    """Update tenant metadata (name, plan, limits, etc.)."""
    clean = {k: v for k, v in updates.items() if v is not None}
    if not clean:
        raise BadRequestException("No fields to update")

    result = await db.hospitals.update_one(
        {"hospital_id": hospital_id}, {"$set": clean}
    )
    if result.matched_count == 0:
        raise NotFoundException("Hospital")

    return await get_tenant(hospital_id, db)


async def regenerate_invite_code(
    hospital_id: str, db: AsyncIOMotorDatabase
) -> str:
    """Generate a new invite code for a hospital."""
    new_code = str(uuid.uuid4())[:8].upper()
    result = await db.hospitals.update_one(
        {"hospital_id": hospital_id}, {"$set": {"invite_code": new_code}}
    )
    if result.matched_count == 0:
        raise NotFoundException("Hospital")
    return new_code


async def deactivate_tenant(hospital_id: str, db: AsyncIOMotorDatabase):
    """Soft-delete a tenant."""
    result = await db.hospitals.update_one(
        {"hospital_id": hospital_id}, {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise NotFoundException("Hospital")
