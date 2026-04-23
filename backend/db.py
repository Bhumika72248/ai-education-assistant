from sqlmodel import SQLModel, create_engine, Session, select
from dotenv import load_dotenv
from datetime import datetime, timedelta
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
    from models.schemas import ChatMessage
    with Session(engine) as session:
        messages = session.exec(
            select(ChatMessage)
            .where(ChatMessage.user_id == int(student_id))
            .order_by(ChatMessage.created_at)
        ).all()
        return [{"role": m.role, "content": m.content, "session_id": m.session_id, "created_at": m.created_at} for m in messages]

def get_student_analytics(student_id: str):
    from models.schemas import QuizAttempt
    with Session(engine) as session:
        attempts = session.exec(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == int(student_id))
            .order_by(QuizAttempt.created_at)
        ).all()

        total_quizzes = len(attempts)
        avg_score = round(sum(a.score for a in attempts) / total_quizzes, 1) if total_quizzes > 0 else 0

        # calculate streak: consecutive days with at least one quiz
        streak = 0
        if attempts:
            today = datetime.utcnow().date()
            check_date = today
            dates = {a.created_at.date() for a in attempts}
            while check_date in dates:
                streak += 1
                check_date -= timedelta(days=1)

        return {"total_quizzes": total_quizzes, "avg_score": avg_score, "streak": streak}
