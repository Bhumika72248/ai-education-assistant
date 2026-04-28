import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from db import get_session, engine
from sqlmodel import Session, select
from models.schemas import Course, CourseEnrollment, AssignedTopic, User, QuizAttempt
from agents.path_agent import generate_learning_path
import json

load_dotenv()

router = APIRouter()


class RecommendRequest(BaseModel):
    weak_topics: List[str]


@router.post("/recommend")
async def recommend_courses(req: RecommendRequest):
    if not req.weak_topics:
        return {"recommendations": []}

    topics_str = ", ".join(req.weak_topics)
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3,
    )
    
    prompt = f"""
You are an expert educational AI tutor. A student is struggling with the following topics: {topics_str}.
Please recommend 1 YouTube search query, 1 article/documentation link, and 1 free online course idea for EACH topic.

Respond strictly with a JSON array of objects. Each object should have the following format:
{{
  "topic": "Name of the topic",
  "youtube": "YouTube search query or link",
  "article": "Article or documentation description or link",
  "course": "Name of a free course (e.g., on Coursera, edX, or Khan Academy)"
}}

Do NOT wrap the response in markdown blocks (e.g., ```json). Return ONLY the raw JSON array.
"""

    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        
        recommendations = json.loads(content.strip())
        return {"recommendations": recommendations}
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return {"recommendations": []}


@router.get("/catalog")
async def get_catalog():
    # Read catalog from DB; seed defaults if empty
    with Session(engine) as s:
        courses = s.exec(select(Course)).all()
        if not courses:
            defaults = [
                Course(title="Intro to Programming (Tech)", category="tech", level="beginner", topics="Variables,Control Flow,Functions", description="A gentle introduction to programming"),
                Course(title="Web Development Bootcamp", category="tech", level="intermediate", topics="HTML,CSS,JavaScript,React", description="Full-stack web development basics"),
                Course(title="UPSC General Studies", category="upsc", level="advanced", topics="History,Polity,Geography", description="Comprehensive UPSC GS prep"),
                Course(title="JEE Physics Mastery", category="jee", level="advanced", topics="Mechanics,Electrodynamics", description="In-depth physics for JEE"),
                Course(title="NEET Biology Foundation", category="neet", level="intermediate", topics="Botany,Zoology", description="Biology concepts for NEET"),
                Course(title="Career Skills (Non-tech)", category="non-tech", level="beginner", topics="Communication,Resume", description="Soft skills and career readiness"),
            ]
            for c in defaults:
                s.add(c)
            s.commit()
            courses = s.exec(select(Course)).all()

        return {"courses": [c.dict() for c in courses]}


class AssignRequest(BaseModel):
    user_id: int
    course_id: int


@router.post("/assign")
async def assign_course(req: AssignRequest, session: Session = Depends(get_session)):
    # validate user exists
    user = session.exec(select(User).where(User.id == req.user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # For now, catalog is static; map course_id to catalog entry
    catalog = (await get_catalog())["courses"]
    course = next((c for c in catalog if c["id"] == req.course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # create enrollment record
    enrollment = CourseEnrollment(user_id=req.user_id, course_id=req.course_id)
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)

    # also add an AssignedTopic to reflect the selected course topic(s)
    topics = course.get("topics", "").split(",") if course.get("topics") else [course.get("title")]
    for t in topics:
        at = AssignedTopic(topic=t.strip(), assigned_by=req.user_id, assigned_to=str(req.user_id))
        session.add(at)
    session.commit()

    # generate updated learning path using existing attempts for the user
    attempts = session.exec(select(QuizAttempt).where(QuizAttempt.user_id == req.user_id)).all()
    try:
        # build a small history summary
        history_summary = f"Enrolled in {course['title']}. Topics: {', '.join(topics)}"
        learning_path = generate_learning_path(history_summary, [], topics, 0.0)
    except Exception:
        learning_path = None

    return {"enrollment_id": enrollment.id, "learning_path": learning_path}


@router.get("/enrollments")
async def list_enrollments(user_id: int, session: Session = Depends(get_session)):
    enrolls = session.exec(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id)).all()
    return {"enrollments": [e.dict() for e in enrolls]}


@router.post("/")
async def create_course(course: Course, session: Session = Depends(get_session)):
    session.add(course)
    session.commit()
    session.refresh(course)
    return {"course": course.dict()}


@router.put("/{course_id}")
async def update_course(course_id: int, course_in: Course, session: Session = Depends(get_session)):
    existing = session.get(Course, course_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")
    existing.title = course_in.title
    existing.category = course_in.category
    existing.level = course_in.level
    existing.description = course_in.description
    existing.topics = course_in.topics
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return {"course": existing.dict()}


@router.delete("/{course_id}")
async def delete_course(course_id: int, session: Session = Depends(get_session)):
    existing = session.get(Course, course_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")
    session.delete(existing)
    session.commit()
    return {"status": "deleted"}
