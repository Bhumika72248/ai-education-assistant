from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

def ingest_pdf(pdf_path: str, index_path: str = "faiss_index"):
    docs = PyPDFLoader(pdf_path).load()
    chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)
    db = FAISS.from_documents(chunks, OpenAIEmbeddings())
    db.save_local(index_path)
