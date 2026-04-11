from fastapi import APIRouter
from agents.tutor_agent import ask_tutor
from db import get_chat_history

router = APIRouter()

@router.post("/ask")
async def ask(question: str, student_id: str):
    return {"response": await ask_tutor(question, student_id)}

@router.get("/history")
async def history(student_id: str):
    return {"history": get_chat_history(student_id)}
