"""AI Analysis orchestrator."""

from motor.motor_asyncio import AsyncIOMotorDatabase
from core.exceptions import BadRequestException
from routes.scan.service import get_scan, save_ai_result


async def analyze_scan(scan_id: str, tenant_db: AsyncIOMotorDatabase) -> dict:
    scan = await get_scan(scan_id, tenant_db)

    if not scan.get("image_path"):
        raise BadRequestException("Scan has no uploaded image. Upload first.")

    if scan.get("status") == "analyzed":
        return scan

    await tenant_db.scans.update_one(
        {"scan_id": scan_id}, {"$set": {"status": "processing"}}
    )

    try:
        # Placeholder — wire real model later
        ai_result = {
            "prediction": "normal",
            "confidence": 0.0,
            "gradcam_path": None,
            "rag_explanation": "AI pipeline not yet connected.",
        }
        return await save_ai_result(scan_id, ai_result, tenant_db)
    except Exception as e:
        await tenant_db.scans.update_one(
            {"scan_id": scan_id}, {"$set": {"status": "failed"}}
        )
        raise BadRequestException(f"Analysis failed: {str(e)}")
