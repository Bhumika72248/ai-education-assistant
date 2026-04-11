from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

_db = None

def _load_db(index_path: str = "faiss_index"):
    global _db
    if _db is None:
        _db = FAISS.load_local(index_path, OpenAIEmbeddings())
    return _db

def retrieve_context(query: str, k: int = 4) -> str:
    docs = _load_db().similarity_search(query, k=k)
    return "\n".join(d.page_content for d in docs)
