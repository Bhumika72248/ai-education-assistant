from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from db import get_session
from models.schemas import QuizAttempt, User, EngagementLog, EngagementRequest
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
    consistency = min(100, (days_studied / 7) * 100) # Out of 7 days

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

