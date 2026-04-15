import fitz
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

FAISS_PATH = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index")


def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    return "\n".join(page.get_text() for page in doc)


def ingest_document(pdf_path: str, doc_name: str) -> int:
    raw_text = extract_text_from_pdf(pdf_path)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunks = splitter.create_documents(
        [raw_text],
        metadatas=[{"source": doc_name}]
    )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )

    index_file = os.path.join(FAISS_PATH, "index.faiss")
    if os.path.exists(index_file):
        db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
        db.add_documents(chunks)
    else:
        os.makedirs(FAISS_PATH, exist_ok=True)
        db = FAISS.from_documents(chunks, embeddings)

    db.save_local(FAISS_PATH)
    return len(chunks)
