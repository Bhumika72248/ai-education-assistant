from fastapi import APIRouter
from agents.eval_agent import evaluate_assignment
from models.schemas import AssignmentSubmission

router = APIRouter()

@router.post("/evaluate")
async def evaluate(submission: AssignmentSubmission):
    return {"evaluation": await evaluate_assignment(submission)}
