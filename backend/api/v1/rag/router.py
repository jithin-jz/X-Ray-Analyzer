from fastapi import APIRouter, Depends

from core.dependencies import require_doctor
from api.v1.rag.schemas import RAGQuerySchema
from api.v1.rag.service import query_rag

router = APIRouter(prefix="/rag", tags=["RAG Pipeline"])


@router.post("/query")
async def rag_query(
    data: RAGQuerySchema,
    user: dict = Depends(require_doctor),
):
    """Query the medical knowledge base via RAG."""
    return await query_rag(data.query, data.scan_id)
