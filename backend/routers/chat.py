import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from db import get_session
from models.schemas import ChatRequest, ChatMessage
from agents.tutor_agent import get_tutor_chain
from rag.ingest import ingest_document
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


@router.post("/ask")
async def ask_question(req: ChatRequest, session: Session = Depends(get_session)):
    chain = get_tutor_chain()

    full_response_chunks = []

    def token_stream():
        for chunk in chain.stream(req.message):
            if not chunk:
                continue
            text = str(chunk)
            full_response_chunks.append(text)
            yield text

        # Persist chat transcript for /chat/history support.
        assistant_reply = "".join(full_response_chunks).strip()
        user_message = ChatMessage(
            user_id=1,
            role="user",
            content=req.message,
            session_id=req.session_id,
        )
        session.add(user_message)
        if assistant_reply:
            assistant_message = ChatMessage(
                user_id=1,
                role="assistant",
                content=assistant_reply,
                session_id=req.session_id,
            )
            session.add(assistant_message)
        session.commit()

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
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv("GROQ_API_KEY"),
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
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()
    return {"history": [{"role": m.role, "content": m.content} for m in messages]}
