import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
import httpx
from sqlmodel import Session, select
from db import get_session
from models.schemas import ChatRequest, ChatMessage
from agents.tutor_agent import get_tutor_chain
from rag.ingest import ingest_document
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/tts")
async def generate_tts(req: TTSRequest):
    api_key = os.getenv("VOICE_API_KEY")
    if not api_key:
        print("TTS Error: VOICE_API_KEY not found in environment")
        raise HTTPException(status_code=500, detail="VOICE_API_KEY not configured")

    print(f"TTS Request received for text: {req.text[:50]}...")
    
    # ElevenLabs Bella voice ID
    voice_id = "EXAVITQu4vr4xnSDxMaL"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    data = {
        "text": req.text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("Attempting ElevenLabs TTS...")
            response = await client.post(url, json=data, headers=headers, timeout=10.0)
            if response.status_code == 200:
                print("ElevenLabs TTS successful")
                return Response(content=response.content, media_type="audio/mpeg")
            else:
                print(f"ElevenLabs failed: {response.status_code} - {response.text}")
                # If it fails, we will try OpenAI as a fallback
                openai_key = api_key # Assuming they might have used OpenAI key
                if openai_key.startswith("sk-") or "invalid" in response.text.lower() or response.status_code == 401:
                    print("Attempting OpenAI fallback...")
                    o_url = "https://api.openai.com/v1/audio/speech"
                    o_headers = {"Authorization": f"Bearer {api_key}"}
                    o_data = {"model": "tts-1", "input": req.text, "voice": "nova"}
                    o_response = await client.post(o_url, json=o_data, headers=o_headers, timeout=10.0)
                    if o_response.status_code == 200:
                        print("OpenAI TTS successful")
                        return Response(content=o_response.content, media_type="audio/mpeg")
                    else:
                        print(f"OpenAI fallback failed: {o_response.status_code} - {o_response.text}")
                
                raise HTTPException(status_code=response.status_code, detail="TTS generation failed")
        except Exception as e:
            print(f"TTS Exception: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))



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
