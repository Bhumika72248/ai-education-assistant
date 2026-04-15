import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models.schemas import QuizRequest, QuizAttempt
from agents.quiz_agent import generate_quiz

router = APIRouter()


@router.post("/generate")
async def generate(req: QuizRequest):
    quiz = generate_quiz(req.topic, req.num_questions, req.difficulty)
    return {"quiz": quiz}


@router.post("/submit")
async def submit(
    topic: str,
    user_id: int,
    answers: dict,
    questions_json: str,
    session: Session = Depends(get_session)
):
    questions = json.loads(questions_json)
    correct = sum(
        1 for q in questions
        if answers.get(str(q["id"]), "").upper() == q["correct"].upper()
    )
    total = len(questions)
    score = round((correct / total) * 100, 1) if total else 0

    attempt = QuizAttempt(
        user_id=user_id,
        topic=topic,
        score=score,
        total=total,
        questions_json=questions_json,
    )
    session.add(attempt)
    session.commit()
    session.refresh(attempt)

    return {"score": score, "correct": correct, "total": total, "attempt_id": attempt.id}


@router.get("/history")
async def history(user_id: int, session: Session = Depends(get_session)):
    attempts = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == user_id)
    ).all()
    return {"history": [
        {"id": a.id, "topic": a.topic, "score": a.score, "total": a.total, "created_at": a.created_at}
        for a in attempts
    ]}
