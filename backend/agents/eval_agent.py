from models.schemas import AssignmentSubmission

async def evaluate_assignment(submission: AssignmentSubmission) -> dict:
    # TODO: use LLM to evaluate assignment and return feedback + score
    return {"score": 0, "feedback": ""}
