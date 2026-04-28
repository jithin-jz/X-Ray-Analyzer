"""
RAG response generator.
- Takes retrieved document chunks + user query
- Constructs a prompt and calls an LLM
- Returns the generated explanation

TODO: Implement when LLM provider is chosen (OpenAI, local LLM, etc.).
"""


async def generate_response(query: str, context_chunks: list[dict]) -> str:
    """
    Generate a medical explanation using retrieved context.
    Returns the LLM-generated answer string.
    """
    raise NotImplementedError("RAG generator not yet implemented")
