import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from db import get_session
from models.schemas import QuizRequest, QuizAttempt, QuizSubmission, AssignedTopic, User
from agents.quiz_agent import generate_quiz
from routers.auth import get_current_user

router = APIRouter()


@router.post("/generate")
async def generate(req: QuizRequest):
    try:
        quiz_data = generate_quiz(req.topic, req.num_questions, req.difficulty)
        questions = quiz_data.get("questions", [])
        return {"quiz": questions}
    except Exception as e:
        import traceback
        error_detail = f"Failed to generate quiz: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)


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


class AssignTopicRequest(BaseModel):
    topic: str


@router.post("/assign")
def assign_topic(
    body: AssignTopicRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can assign topics")
    assigned = AssignedTopic(topic=body.topic, assigned_by=current_user.id)
    session.add(assigned)
    session.commit()
    session.refresh(assigned)
    print(f"[QUIZ] Topic assigned: '{body.topic}' by teacher_id={current_user.id}")
    return {"message": f"Topic '{body.topic}' assigned to all students", "id": assigned.id}


@router.get("/assigned")
def get_assigned_topics(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    topics = session.exec(select(AssignedTopic).order_by(AssignedTopic.created_at.desc())).all()
    return {"assigned_topics": [
        {"id": t.id, "topic": t.topic, "created_at": t.created_at}
        for t in topics
    ]}
