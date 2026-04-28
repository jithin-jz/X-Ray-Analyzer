from fastapi import APIRouter, Depends

from core.dependencies import require_doctor
from routes.rag.schemas import RAGQuerySchema
from routes.rag.service import query_rag

router = APIRouter(prefix="/rag", tags=["RAG Pipeline"])


@router.post("/query")
async def rag_query(
    data: RAGQuerySchema,
    user: dict = Depends(require_doctor),
):
    """Query the medical knowledge base via RAG."""
    return await query_rag(data.query, data.scan_id)
