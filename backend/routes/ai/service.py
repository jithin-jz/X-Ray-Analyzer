"""
AI Analysis orchestrator.
Coordinates: image loading → preprocessing → inference → grad-cam → RAG explanation → save result.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase

from core.exceptions import BadRequestException, NotFoundException
from routes.scan.service import get_scan, save_ai_result


async def analyze_scan(
    scan_id: str, tenant_db: AsyncIOMotorDatabase
) -> dict:
    """
    Full AI analysis pipeline for a scan.
    1. Load scan record & validate it has an image
    2. Preprocess image
    3. Run model inference
    4. Generate Grad-CAM
    5. (Optional) RAG explanation
    6. Save results back to scan
    """
    scan = await get_scan(scan_id, tenant_db)

    if not scan.get("image_path"):
        raise BadRequestException("Scan has no uploaded image. Upload first.")

    if scan.get("status") == "analyzed":
        return scan

    # Mark as processing
    await tenant_db.scans.update_one(
        {"scan_id": scan_id}, {"$set": {"status": "processing"}}
    )

    try:
        # TODO: Wire up real pipeline when model is ready
        # from routes.ai.preprocessing import preprocess_image
        # from routes.ai.inference import run_inference
        # from routes.ai.gradcam import generate_gradcam

        # preprocessed = await preprocess_image(scan["image_path"])
        # result = await run_inference(preprocessed)
        # gradcam_path = await generate_gradcam(scan["image_path"], model, preprocessed)

        # Placeholder result for development
        ai_result = {
            "prediction": "normal",
            "confidence": 0.0,
            "gradcam_path": None,
            "rag_explanation": "AI pipeline not yet connected.",
        }

        return await save_ai_result(scan_id, ai_result, tenant_db)

    except NotImplementedError:
        await tenant_db.scans.update_one(
            {"scan_id": scan_id}, {"$set": {"status": "failed"}}
        )
        raise BadRequestException("AI pipeline not yet implemented")
    except Exception as e:
        await tenant_db.scans.update_one(
            {"scan_id": scan_id}, {"$set": {"status": "failed"}}
        )
        raise BadRequestException(f"Analysis failed: {str(e)}")
