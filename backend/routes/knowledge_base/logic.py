"""
RAG pipeline orchestrator.
Coordinates: query → retrieval → generation → response.
"""

from config.errors import BadRequestException


async def query_rag(query: str, scan_id: str | None = None) -> dict:
    """
    Run a RAG query. Optionally enriches context with scan data.
    """
    try:
        from routes.knowledge_base.retriever import retrieve_documents
        from routes.knowledge_base.generator import generate_response

        chunks = await retrieve_documents(query)
        answer = await generate_response(query, chunks)

        return {
            "answer": answer,
            "sources": [{"content": c["content"][:200], "score": c.get("score")} for c in chunks],
        }
    except NotImplementedError:
        raise BadRequestException("RAG pipeline not yet implemented")
