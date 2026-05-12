from typing import Optional

from pydantic import BaseModel


class RAGQuerySchema(BaseModel):
    query: str
    scan_id: Optional[str] = None  # optionally tie to a scan for context


class RAGResponse(BaseModel):
    answer: str
    sources: list[dict] = []
