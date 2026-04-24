from sqlmodel import SQLModel, Field
from typing import Optional, Any
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    role: str = "student"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role: str
    content: str
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    topic: str
    score: float
    total: int
    questions_json: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    student_answer: str
    ai_score: Optional[float] = None
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(SQLModel):
    message: str
    session_id: str = "default"

class QuizRequest(SQLModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "medium"
    adaptive: bool = False

class YouTubeQuizRequest(SQLModel):
    url: str

class ExamQuizRequest(SQLModel):
    exam: str
    section: str
    num_questions: int = 5

class QuizAttemptCreate(SQLModel):
    user_id: Optional[int] = None
    topic: str
    score: float
    total: int
    questions_json: str

class AssignmentRequest(SQLModel):
    title: str
    student_answer: str
    rubric: Optional[str] = None

class QuizSubmission(SQLModel):
    user_id: Optional[int] = None
    topic: str
    answers: dict
    questions: list[dict[str, Any]]

class AssignmentSubmission(SQLModel):
    user_id: Optional[int] = None
    title: str
    student_answer: str

class CourseMaterial(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    file_url: str
    uploaded_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssignedTopic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic: str
    assigned_by: int = Field(foreign_key="user.id")
    assigned_to: str = "all_students"
    created_at: datetime = Field(default_factory=datetime.utcnow)


