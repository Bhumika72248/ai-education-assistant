from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from db import get_session
from models.schemas import QuizAttempt, User, EngagementLog, EngagementRequest, StudySession, CourseEnrollment
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

@router.post("/log-engagement")
async def log_engagement(req: EngagementRequest, session: Session = Depends(get_session)):
    log = EngagementLog(
        user_id=req.user_id,
        engagement_score=req.engagement_score,
        emotion=req.emotion
    )
    session.add(log)
    session.commit()
    return {"message": "Engagement logged"}


@router.get("/radar")
async def radar_stats(user_id: int, session: Session = Depends(get_session)):
    attempts = session.exec(select(QuizAttempt).where(QuizAttempt.user_id == user_id)).all()
    if not attempts:
        # Mock Data for Hackathon Presentation
        return {"labels": ["Accuracy", "Speed", "Consistency", "Complexity", "Retention"], "data": [85, 70, 92, 60, 88]}

    # Accuracy: Avg score
    accuracy = sum(a.score for a in attempts) / len(attempts)

    # Speed: Mocking for now
    speed = min(100, 60 + (len(attempts) * 2))

    # Consistency: Frequency of study
    days_studied = len(set(a.created_at.date() for a in attempts))
    consistency = min(100, (days_studied / 7) * 100)  # Out of 7 days

    # Complexity: Variety of topics
    topics_covered = len(set(a.topic for a in attempts))
    complexity = min(100, (topics_covered / 5) * 100)

    # Retention: Persistence (number of attempts)
    retention = min(100, (len(attempts) / 10) * 100)

    return {
        "labels": ["Accuracy", "Speed", "Consistency", "Complexity", "Retention"],
        "data": [round(accuracy, 1), round(speed, 1), round(consistency, 1), round(complexity, 1), round(retention, 1)]
    }


@router.get("/engagement-correlation")
async def engagement_correlation(user_id: int, session: Session = Depends(get_session)):
    quizzes = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == user_id).order_by(QuizAttempt.created_at.desc()).limit(10)
    ).all()

    correlation_data = []
    if not quizzes:
        # Mock Data for Hackathon Presentation
        return [
            {"date": "Apr 15", "score": 60, "engagement": 45, "topic": "React Hooks"},
            {"date": "Apr 16", "score": 75, "engagement": 60, "topic": "State Mgmt"},
            {"date": "Apr 17", "score": 85, "engagement": 88, "topic": "FastAPI"},
            {"date": "Apr 18", "score": 70, "engagement": 50, "topic": "SQLModel"},
            {"date": "Apr 19", "score": 90, "engagement": 95, "topic": "Data Structures"},
            {"date": "Apr 20", "score": 88, "engagement": 85, "topic": "Algorithms"},
            {"date": "Apr 21", "score": 95, "engagement": 98, "topic": "System Design"}
        ]

    for q in quizzes:
        logs = session.exec(
            select(EngagementLog).where(
                EngagementLog.user_id == user_id,
                EngagementLog.created_at <= q.created_at
            ).order_by(EngagementLog.created_at.desc()).limit(5)
        ).all()

        avg_engagement = sum(l.engagement_score for l in logs) / len(logs) if logs else 0.5
        correlation_data.append({
            "topic": q.topic,
            "score": q.score,
            "engagement": round(avg_engagement * 100, 1),
            "date": q.created_at.strftime("%b %d")
        })

    return correlation_data


from services.analytics_service import (
    get_momentum_score,
    get_topic_mastery,
    get_burnout_flags,
    get_deadline_predictions,
    generate_ai_insights
)

@router.get("/momentum")
async def momentum(user_id: int = 1, session: Session = Depends(get_session)):
    return get_momentum_score(session, user_id)

@router.get("/mastery")
async def mastery(user_id: int = 1, session: Session = Depends(get_session)):
    return get_topic_mastery(session, user_id)

@router.get("/burnout-flags")
async def burnout_flags(user_id: int = 1, session: Session = Depends(get_session)):
    return get_burnout_flags(session, user_id)

@router.post("/burnout-flags/{topic_id}/dismiss")
async def dismiss_burnout_flag(topic_id: str, user_id: int = 1, session: Session = Depends(get_session)):
    # Mocking dismiss functionality
    return {"message": "Flag dismissed for 48 hours"}

@router.get("/deadline-predictions")
async def deadline_predictions(user_id: int = 1, session: Session = Depends(get_session)):
    return get_deadline_predictions(session, user_id)

@router.get("/insights")
async def insights(user_id: int = 1, session: Session = Depends(get_session)):
    return generate_ai_insights(session, user_id)


@router.post("/log-session")
async def log_study_session(user_id: int, topic: str, duration_hours: float, session: Session = Depends(get_session)):
    ss = StudySession(user_id=user_id, topic=topic, duration_hours=duration_hours)
    session.add(ss)
    session.commit()
    session.refresh(ss)
    return {"status": "ok", "session": ss.dict()}

