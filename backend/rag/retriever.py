import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

FAISS_PATH = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index")


def get_retriever(k: int = 5):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    return db.as_retriever(search_kwargs={"k": k})
