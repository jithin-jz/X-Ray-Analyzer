"""
Document ingestion pipeline for RAG.
- Reads medical PDFs / text documents
- Splits into chunks
- Embeds and stores in vector database

TODO: Implement when vector store is configured.
"""


async def ingest_document(file_path: str, metadata: dict | None = None):
    """
    Ingest a document into the vector store for retrieval.
    """
    raise NotImplementedError("Document ingestion not yet implemented")
