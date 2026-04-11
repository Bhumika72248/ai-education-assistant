from rag.retriever import retrieve_context

async def ask_tutor(question: str, student_id: str) -> str:
    context = retrieve_context(question)
    # TODO: pass context + question to LLM
    return f"Answer based on context: {context[:200]}"
