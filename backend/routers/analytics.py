from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from db import get_session
from models.schemas import QuizAttempt, User
from agents.path_agent import generate_learning_path

router = APIRouter()


@router.get("/me")
async def my_analytics(user_id: int, session: Session = Depends(get_session)):
    attempts = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == user_id)
    ).all()

    if not attempts:
        return {"total_quizzes": 0, "avg_score": 0, "topics": [], "scores": [], "dates": [], "quiz_scores": [], "streak": 0, "learning_path": None}

    topic_scores: dict[str, list] = {}
    for a in attempts:
        topic_scores.setdefault(a.topic, []).append(a.score)

    topics = list(topic_scores.keys())
    avg_per_topic = [round(sum(v) / len(v), 1) for v in topic_scores.values()]
    overall_avg = round(sum(a.score for a in attempts) / len(attempts), 1)

    strong = [t for t, s in zip(topics, avg_per_topic) if s >= 70]
    weak = [t for t, s in zip(topics, avg_per_topic) if s < 70]

    history_summary = "; ".join(f"{t}: {s}%" for t, s in zip(topics, avg_per_topic))
    learning_path = generate_learning_path(history_summary, strong, weak, overall_avg)

    sorted_attempts = sorted(attempts, key=lambda a: a.created_at)

    return {
        "total_quizzes": len(attempts),
        "avg_score": overall_avg,
        "topics": topics,
        "scores": avg_per_topic,
        "dates": [a.created_at.strftime("%b %d") for a in sorted_attempts],
        "quiz_scores": [a.score for a in sorted_attempts],
        "streak": len(set(a.created_at.date() for a in attempts)),
        "learning_path": learning_path,
    }


@router.get("/class")
async def class_analytics(session: Session = Depends(get_session)):
    attempts = session.exec(select(QuizAttempt)).all()

    topic_scores: dict[str, list] = {}
    for a in attempts:
        topic_scores.setdefault(a.topic, []).append(a.score)

    topics = list(topic_scores.keys())
    avg_per_topic = [round(sum(v) / len(v), 1) for v in topic_scores.values()]

    students = session.exec(select(User).where(User.role == "student")).all()
    student_stats = []
    for s in students:
        s_attempts = [a for a in attempts if a.user_id == s.id]
        avg = round(sum(a.score for a in s_attempts) / len(s_attempts), 1) if s_attempts else 0
        student_stats.append({"name": s.name, "email": s.email, "avg_score": avg, "quizzes": len(s_attempts)})

    student_stats.sort(key=lambda x: x["avg_score"], reverse=True)

    return {
        "topics": topics,
        "avg_scores": avg_per_topic,
        "students": student_stats,
        "weak_topics": [t for t, s in zip(topics, avg_per_topic) if s < 60],
    }
