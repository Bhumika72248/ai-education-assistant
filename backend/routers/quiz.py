from fastapi import APIRouter
from agents.quiz_agent import generate_quiz, evaluate_quiz
from models.schemas import QuizSubmission

router = APIRouter()

@router.post("/generate")
async def generate(topic: str, num_questions: int = 5):
    return {"quiz": await generate_quiz(topic, num_questions)}

@router.post("/submit")
async def submit(submission: QuizSubmission):
    return {"result": await evaluate_quiz(submission)}
