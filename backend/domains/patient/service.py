import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from core.exceptions import NotFoundException


async def create_patient(
    data: dict, user_email: str, tenant_db: AsyncIOMotorDatabase
) -> dict:
    patient_id = str(uuid.uuid4())
    doc = {
        "patient_id": patient_id,
        "name": data["name"],
        "age": data["age"],
        "gender": data["gender"],
        "contact": data.get("contact"),
        "medical_history": data.get("medical_history", []),
        "created_by": user_email,
        "created_at": datetime.now(timezone.utc),
    }
    await tenant_db.patients.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def list_patients(tenant_db: AsyncIOMotorDatabase) -> list[dict]:
    cursor = tenant_db.patients.find({}, {"_id": 0})
    return await cursor.to_list(5000)


async def get_patient(patient_id: str, tenant_db: AsyncIOMotorDatabase) -> dict:
    patient = await tenant_db.patients.find_one(
        {"patient_id": patient_id}, {"_id": 0}
    )
    if not patient:
        raise NotFoundException("Patient")
    return patient


async def update_patient(
    patient_id: str, updates: dict, tenant_db: AsyncIOMotorDatabase
) -> dict:
    clean = {k: v for k, v in updates.items() if v is not None}
    if not clean:
        return await get_patient(patient_id, tenant_db)

    result = await tenant_db.patients.update_one(
        {"patient_id": patient_id}, {"$set": clean}
    )
    if result.matched_count == 0:
        raise NotFoundException("Patient")
    return await get_patient(patient_id, tenant_db)


async def delete_patient(patient_id: str, tenant_db: AsyncIOMotorDatabase):
    result = await tenant_db.patients.delete_one({"patient_id": patient_id})
    if result.deleted_count == 0:
        raise NotFoundException("Patient")
