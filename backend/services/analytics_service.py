from sqlmodel import Session, select
from datetime import datetime, timedelta
import random
import os
import google.generativeai as genai

from models.schemas import QuizAttempt, Assignment, MomentumScore, TopicMastery, BurnoutFlag, DeadlinePrediction, AnalyticsInsight

def get_momentum_score(session: Session, student_id: int):
    # Retrieve recent data
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_attempts = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == student_id, QuizAttempt.created_at >= seven_days_ago)
    ).all()
    
    # If no data, return mock data for demonstration
    if not recent_attempts:
        return {
            "score": 78,
            "submission_pace_score": 80,
            "time_trend_score": 75,
            "consistency_score": 80,
            "direction": "rising",
            "sparkline": [40, 45, 55, 50, 60, 65, 70, 68, 75, 80, 78, 82, 85, 78]
        }

    # Simplified momentum calculation
    submissions = len(recent_attempts)
    consistency = len(set(a.created_at.date() for a in recent_attempts))
    
    score = min(100, (submissions * 5) + (consistency * 10))
    direction = "rising" if score > 50 else "stable"
    
    sparkline = [max(0, min(100, score - 20 + random.randint(0, 40))) for _ in range(14)]
    sparkline[-1] = score
    
    return {
        "score": score,
        "submission_pace_score": min(100, submissions * 10),
        "time_trend_score": score,
        "consistency_score": min(100, consistency * 15),
        "direction": direction,
        "sparkline": sparkline
    }

def get_topic_mastery(session: Session, student_id: int):
    attempts = session.exec(
        select(QuizAttempt).where(QuizAttempt.user_id == student_id)
    ).all()
    
    if not attempts:
        # Return mock curriculum tree
        return [
            {"topic_id": "Basics", "mastery_percent": 95, "tier": "mastered", "prereq": None},
            {"topic_id": "Data Types", "mastery_percent": 82, "tier": "mastered", "prereq": "Basics"},
            {"topic_id": "Functions", "mastery_percent": 65, "tier": "proficient", "prereq": "Basics"},
            {"topic_id": "OOP", "mastery_percent": 40, "tier": "learning", "prereq": "Functions"},
            {"topic_id": "Algorithms", "mastery_percent": 10, "tier": "locked", "prereq": "Functions"},
            {"topic_id": "Data Structures", "mastery_percent": 0, "tier": "locked", "prereq": "OOP"},
        ]
        
    topic_scores = {}
    for a in attempts:
        topic_scores.setdefault(a.topic, []).append(a.score)
        
    results = []
    for topic, scores in topic_scores.items():
        avg = sum(scores) / len(scores)
        tier = "locked"
        if avg >= 80: tier = "mastered"
        elif avg >= 50: tier = "proficient"
        elif avg >= 25: tier = "learning"
        
        results.append({
            "topic_id": topic,
            "mastery_percent": round(avg, 1),
            "tier": tier,
            "prereq": None # Mocking prereqs for actual data
        })
    return results

def get_burnout_flags(session: Session, student_id: int):
    # Mocking burnout flags
    return [
        {"topic_id": "Algorithms", "flag_type": "burnout_risk", "message": "You've been spending a lot of time on Algorithms lately — try a short break and come back fresh."},
        {"topic_id": "Data Structures", "flag_type": "avoidance_risk", "message": "Data Structures hasn't been touched in 10 days and has an upcoming assignment."}
    ]

def get_deadline_predictions(session: Session, student_id: int):
    # Mocking predictions
    return [
        {"assignment_id": 101, "title": "Implement Dijkstra", "topic": "Algorithms", "due_in_days": 3, "prediction": "at_risk", "start_by_date": "Today"},
        {"assignment_id": 102, "title": "Binary Tree Traversal", "topic": "Data Structures", "due_in_days": 7, "prediction": "on_track", "start_by_date": "In 3 days"},
        {"assignment_id": 103, "title": "Sorting Visualization", "topic": "Algorithms", "due_in_days": 12, "prediction": "start_now", "start_by_date": "Tomorrow"}
    ]

def generate_ai_insights(session: Session, student_id: int):
    # Mock insights if no API key
    if not os.getenv("GEMINI_API_KEY"):
        return [
            {"type": "trend", "text": "You score 38% higher on topics you revisit within 48 hours."},
            {"type": "clock", "text": "Your focus is sharpest during morning sessions between 8 AM and 11 AM."},
            {"type": "lightbulb", "text": "Taking a 5-minute break every hour boosts your retention by 15%."}
        ]
        
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = "You are an AI tutor analyzing a student's data. Generate 3 short personalized insights (max 20 words each) about their learning patterns. Return as a plain list separated by pipes (|)."
        response = model.generate_content(prompt)
        parts = response.text.split('|')
        
        insights = []
        icons = ["trend", "clock", "lightbulb"]
        for i, part in enumerate(parts):
            if part.strip() and i < 3:
                insights.append({"type": icons[i % 3], "text": part.strip()})
        return insights if len(insights) == 3 else get_mock_insights()
    except Exception:
        return get_mock_insights()

def get_mock_insights():
    return [
        {"type": "trend", "text": "You score 38% higher on topics you revisit within 48 hours."},
        {"type": "clock", "text": "Your focus is sharpest during morning sessions between 8 AM and 11 AM."},
        {"type": "lightbulb", "text": "Taking a 5-minute break every hour boosts your retention by 15%."}
    ]
