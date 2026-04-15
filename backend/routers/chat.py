import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from db import get_session
from models.schemas import ChatRequest, ChatMessage
from agents.tutor_agent import get_tutor_chain
from rag.ingest import ingest_document
from langchain_google_genai import ChatGoogleGenerativeAI  # noqa
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


@router.post("/ask")
async def ask_question(req: ChatRequest, session: Session = Depends(get_session)):
    chain = get_tutor_chain()

    full_response = []

    def token_stream():
        for chunk in chain.stream({"query": req.message}):
            if "result" in chunk:
                full_response.append(chunk["result"])
                yield chunk["result"]

    return StreamingResponse(token_stream(), media_type="text/event-stream")


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    upload_dir = os.getenv("UPLOADS_PATH", "./data/uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    chunks = ingest_document(file_path, file.filename)
    return {"message": f"Ingested {chunks} chunks from {file.filename}"}


@router.post("/notes")
async def generate_notes(topic: str):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.4,
    )
    prompt = f"""Generate comprehensive study notes on: "{topic}"

Structure them as:
# {topic}
## Overview
## Key Concepts
## Detailed Explanation
## Examples
## Common Mistakes
## Summary
## Practice Questions

Use clear headings, bullet points, and simple language. Be thorough."""

    def stream():
        for chunk in llm.stream(prompt):
            yield chunk.content

    return StreamingResponse(stream(), media_type="text/plain")


@router.get("/history/{session_id}")
async def get_history(session_id: str, session: Session = Depends(get_session)):
    messages = session.exec(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
    ).all()
    return {"history": [{"role": m.role, "content": m.content} for m in messages]}
