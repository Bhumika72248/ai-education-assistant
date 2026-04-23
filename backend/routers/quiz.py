import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models.schemas import QuizRequest, QuizAttempt, QuizSubmission
from agents.quiz_agent import generate_quiz

router = APIRouter()


@router.post("/generate")
async def generate(req: QuizRequest):
    quiz = generate_quiz(req.topic, req.num_questions, req.difficulty)
    return {"quiz": quiz}


@router.post("/submit")
async def submit(req: QuizSubmission, session: Session = Depends(get_session)):
    questions = req.questions
    if not questions:
        raise HTTPException(status_code=400, detail="Questions are required")

    correct = sum(
        1 for q in questions
        if str(req.answers.get(str(q.get("id")), "")).upper() == str(q.get("correct", "")).upper()
    )
    total = len(questions)
    score = round((correct / total) * 100, 1) if total else 0
    questions_json = json.dumps(questions)

    attempt = QuizAttempt(
        user_id=req.user_id or 1,
        topic=req.topic,
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
