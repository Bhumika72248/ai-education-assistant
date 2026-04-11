from pydantic import BaseModel
from typing import Any

class QuizSubmission(BaseModel):
    student_id: str
    quiz_id: str
    answers: dict[str, Any]

class AssignmentSubmission(BaseModel):
    student_id: str
    assignment_id: str
    content: str
