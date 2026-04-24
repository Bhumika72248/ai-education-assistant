from sqlmodel import SQLModel, Field
from typing import Optional
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

class AssignmentSubmission(SQLModel):
    user_id: Optional[int] = None
    title: str
    student_answer: str

class EngagementLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    engagement_score: float  # 0.0 to 1.0
    emotion: str  # "focused", "distracted", "neutral", etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EngagementRequest(SQLModel):
    user_id: int
    engagement_score: float
    emotion: str

class MomentumScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    score: float
    submission_pace_score: float
    time_trend_score: float
    consistency_score: float
    direction: str
    computed_at: datetime = Field(default_factory=datetime.utcnow)

class TopicMastery(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    topic_id: str
    mastery_percent: float
    tier: str
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BurnoutFlag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    topic_id: str
    flag_type: str
    dismissed_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DeadlinePrediction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    assignment_id: int = Field(foreign_key="assignment.id")
    prediction: str
    start_by_date: str
    reasoning_text: str
    computed_at: datetime = Field(default_factory=datetime.utcnow)

class AnalyticsInsight(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    insight_1: str
    insight_2: str
    insight_3: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

