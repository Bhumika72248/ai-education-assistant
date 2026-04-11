from models.schemas import QuizSubmission

async def generate_quiz(topic: str, num_questions: int) -> list:
    # TODO: use LLM to generate quiz questions for topic
    return []

async def evaluate_quiz(submission: QuizSubmission) -> dict:
    # TODO: compare answers and return score
    return {"score": 0, "total": len(submission.answers)}
