from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional
import datetime

DATABASE_URL = "sqlite:///./techhack.db"
engine = create_engine(DATABASE_URL)

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str
    role: str  # "user" | "assistant"
    content: str
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class StudentAnalytics(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str
    quiz_score: float = 0.0
    assignments_completed: int = 0

def create_db():
    SQLModel.metadata.create_all(engine)

def get_chat_history(student_id: str):
    with Session(engine) as session:
        return session.exec(select(ChatMessage).where(ChatMessage.student_id == student_id)).all()

def get_student_analytics(student_id: str):
    with Session(engine) as session:
        return session.exec(select(StudentAnalytics).where(StudentAnalytics.student_id == student_id)).first()
