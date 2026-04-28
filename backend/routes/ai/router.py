from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.dependencies import get_tenant_db, require_doctor
from routes.ai.schemas import AnalyzeRequest
from routes.ai.service import analyze_scan

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post("/analyze")
async def analyze(
    data: AnalyzeRequest,
    user: dict = Depends(require_doctor),
    tenant_db: AsyncIOMotorDatabase = Depends(get_tenant_db),
):
    """Trigger AI analysis for a scan."""
    result = await analyze_scan(data.scan_id, tenant_db)
    return result
