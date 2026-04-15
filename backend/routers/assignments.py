from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db import get_session
from models.schemas import AssignmentRequest, Assignment
from agents.eval_agent import evaluate_assignment as run_eval

router = APIRouter()


@router.post("/evaluate")
async def evaluate(req: AssignmentRequest, user_id: int, session: Session = Depends(get_session)):
    result = run_eval(req.title, req.student_answer, req.rubric)

    record = Assignment(
        user_id=user_id,
        title=req.title,
        student_answer=req.student_answer,
        ai_score=result.get("score"),
        ai_feedback=result.get("detailed_feedback"),
    )
    session.add(record)
    session.commit()

    return {"evaluation": result}


@router.get("/history")
async def history(user_id: int, session: Session = Depends(get_session)):
    records = session.exec(
        select(Assignment).where(Assignment.user_id == user_id)
    ).all()
    return {"history": [
        {"id": r.id, "title": r.title, "score": r.ai_score, "feedback": r.ai_feedback, "created_at": r.created_at}
        for r in records
    ]}
