from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models.schemas import AssignmentRequest, Assignment
from agents.eval_agent import evaluate_assignment as run_eval

router = APIRouter()


@router.post("/evaluate")
async def evaluate(req: AssignmentRequest, user_id: int = 1, session: Session = Depends(get_session)):
    try:
        result = run_eval(req.title, req.student_answer, req.rubric)
    except RuntimeError as exc:
        message = str(exc)
        if "timed out" in message.lower():
            raise HTTPException(status_code=504, detail=message)
        raise HTTPException(status_code=500, detail=message)

    record = Assignment(
        user_id=user_id,
        title=req.title,
        student_answer=req.student_answer,
        ai_score=result.get("score"),
        ai_feedback=result.get("detailed_feedback"),
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    return {"evaluation": result, "assignment_id": record.id}


@router.get("/history")
async def history(user_id: int = 1, session: Session = Depends(get_session)):
    records = session.exec(
        select(Assignment).where(Assignment.user_id == user_id)
    ).all()
    return {"history": [
        {"id": r.id, "title": r.title, "score": r.ai_score, "feedback": r.ai_feedback, "created_at": r.created_at}
        for r in records
    ]}
