from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from db import get_session
from models.schemas import QuizAttempt, User, StudySession, CourseEnrollment
from agents.path_agent import generate_learning_path
import concurrent.futures

router = APIRouter()


@router.get("/me")
async def my_analytics(user_id: int = 1, session: Session = Depends(get_session)):
    attempts = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == user_id)
    ).all()

    # study sessions aggregation
    sessions = session.exec(select(StudySession).where(StudySession.user_id == user_id)).all()

    if not attempts and not sessions:
        return {"total_quizzes": 0, "avg_score": 0, "topics": [], "scores": [], "dates": [], "quiz_scores": [], "streak": 0, "learning_path": None, "study_hours": 0, "days_active": 0}

    topic_scores: dict[str, list] = {}
    for a in attempts:
        topic_scores.setdefault(a.topic, []).append(a.score)

    topics = list(topic_scores.keys())
    avg_per_topic = [round(sum(v) / len(v), 1) for v in topic_scores.values()]
    overall_avg = round(sum(a.score for a in attempts) / len(attempts), 1)

    strong = [t for t, s in zip(topics, avg_per_topic) if s >= 70]
    weak = [t for t, s in zip(topics, avg_per_topic) if s < 70]

    history_summary = "; ".join(f"{t}: {s}%" for t, s in zip(topics, avg_per_topic))
    # Attempt to generate learning path but bound the LLM call with a short timeout
    learning_path = None
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(generate_learning_path, history_summary, strong, weak, overall_avg)
            try:
                learning_path = future.result(timeout=2)
            except concurrent.futures.TimeoutError:
                future.cancel()
                raise
    except Exception:
        # Fast deterministic fallback to avoid blocking the analytics UI
        topics_pool = weak if weak else (strong if strong else [history_summary or "General"])
        days = []
        for i in range(7):
            topic = topics_pool[i % len(topics_pool)]
            tasks = [
                f"Review key concepts of {topic}",
                f"Practice 10 questions on {topic}",
                f"Watch a short tutorial on {topic}",
            ]
            days.append({
                "day": i + 1,
                "focus": topic,
                "tasks": tasks,
                "estimated_time": "30-45 mins",
                "resources": [f"Search: {topic} tutorial", "Article: official docs"],
            })
        learning_path = {
            "weekly_goal": f"Focus on: {', '.join(topics_pool[:3])}",
            "days": days,
            "note": "Fallback plan returned quickly to keep analytics responsive.",
        }

    sorted_attempts = sorted(attempts, key=lambda a: a.created_at) if attempts else []

    # study stats
    total_study = round(sum(s.duration_hours for s in sessions), 1)
    days_active = len(set(s.started_at.date() for s in sessions)) if sessions else 0
    avg_daily_study = round(total_study / days_active, 1) if days_active > 0 else 0

    # enrolled courses
    enrolls = session.exec(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id)).all()

    return {
        "total_quizzes": len(attempts),
        "avg_score": overall_avg,
        "topics": topics,
        "scores": avg_per_topic,
        "dates": [a.created_at.strftime("%b %d") for a in sorted_attempts],
        "quiz_scores": [a.score for a in sorted_attempts],
        "streak": len(set(a.created_at.date() for a in attempts)),
        "learning_path": learning_path,
        "study_hours": total_study,
        "days_active": days_active,
        "avg_daily_study": avg_daily_study,
        "enrollments": [e.dict() for e in enrolls],
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


@router.post("/log-session")
async def log_study_session(user_id: int, topic: str, duration_hours: float, session: Session = Depends(get_session)):
    ss = StudySession(user_id=user_id, topic=topic, duration_hours=duration_hours)
    session.add(ss)
    session.commit()
    session.refresh(ss)
    return {"status": "ok", "session": ss.dict()}
