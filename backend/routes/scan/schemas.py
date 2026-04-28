from pydantic import BaseModel
from typing import Optional


class ScanCreateSchema(BaseModel):
    patient_id: str
    scan_type: str = "chest_xray"  # chest_xray | hand_xray | etc.
    notes: Optional[str] = None


class ScanOut(BaseModel):
    scan_id: str
    patient_id: str
    scan_type: str
    status: str  # uploaded | processing | analyzed | failed
    image_path: Optional[str] = None
    ai_result: Optional[dict] = None
    notes: Optional[str] = None
    created_by: str


class AIResultSchema(BaseModel):
    prediction: str
    confidence: float
    gradcam_path: Optional[str] = None
    rag_explanation: Optional[str] = None
