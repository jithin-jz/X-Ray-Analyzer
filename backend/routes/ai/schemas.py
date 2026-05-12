from typing import Optional

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    scan_id: str


class AnalyzeResponse(BaseModel):
    scan_id: str
    prediction: str
    confidence: float
    gradcam_path: Optional[str] = None
    rag_explanation: Optional[str] = None
    status: str = "analyzed"
