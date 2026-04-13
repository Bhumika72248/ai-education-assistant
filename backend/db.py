from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eduai.db")
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def get_chat_history(student_id: str):
    # TODO: Implement DB fetch
    return []

def get_student_analytics(student_id: str):
    # TODO: Implement database logic
    return {"total_quizzes": 0, "avg_score": 0, "streak": 0}
