from pydantic import BaseModel
from typing import Optional


class RAGQuerySchema(BaseModel):
    query: str
    scan_id: Optional[str] = None  # optionally tie to a scan for context


class RAGResponse(BaseModel):
    answer: str
    sources: list[dict] = []
