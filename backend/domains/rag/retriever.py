"""
Document retriever for RAG pipeline.
- Searches a vector store (e.g. ChromaDB, Pinecone, or MongoDB Atlas Search)
- Returns top-K relevant chunks

TODO: Implement when vector store is configured.
"""


async def retrieve_documents(query: str, top_k: int = 5) -> list[dict]:
    """
    Retrieve the most relevant document chunks for a query.
    Returns list of {"content": str, "metadata": dict, "score": float}
    """
    raise NotImplementedError("Document retriever not yet implemented")
