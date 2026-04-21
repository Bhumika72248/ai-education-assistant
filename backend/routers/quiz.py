from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from agents.quiz_agent import generate_quiz, generate_youtube_quiz, generate_exam_quiz, evaluate_quiz
from models.schemas import QuizRequest, YouTubeQuizRequest, ExamQuizRequest, QuizAttemptCreate, QuizAttempt, QuizSubmission
from db import get_session
import json

router = APIRouter()

@router.post("/generate")
async def generate(request: QuizRequest):
    try:
        quiz = await generate_quiz(
            topic=request.topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            adaptive=request.adaptive
        )
        return {"quiz": quiz}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/from-youtube")
async def from_youtube(request: YouTubeQuizRequest):
    try:
        quiz = await generate_youtube_quiz(request.url)
        return {"quiz": quiz}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing YouTube video")

@router.post("/exam-prep")
async def exam_prep(request: ExamQuizRequest):
    try:
        result = await generate_exam_quiz(
            exam=request.exam,
            section=request.section,
            num_questions=request.num_questions
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-attempt")
async def save_attempt(attempt: QuizAttemptCreate, session: Session = Depends(get_session)):
    user_id_to_save = attempt.user_id if attempt.user_id else 1
    
    db_attempt = QuizAttempt(
        user_id=user_id_to_save,
        topic=attempt.topic,
        score=attempt.score,
        total=attempt.total,
        questions_json=attempt.questions_json
    )
    session.add(db_attempt)
    session.commit()
    session.refresh(db_attempt)
    return {"message": "Attempt saved successfully", "attempt_id": db_attempt.id}

@router.get("/weakest-topic")
async def weakest_topic(session: Session = Depends(get_session)):
    attempts = session.exec(select(QuizAttempt).where(QuizAttempt.user_id == 1)).all()
    if not attempts:
        return {"topic": "General Aptitude"}
    
    topic_scores = {}
    for a in attempts:
        if a.topic not in topic_scores:
            topic_scores[a.topic] = []
        topic_scores[a.topic].append(a.score / a.total if a.total > 0 else 0)
        
    avg_scores = {topic: sum(scores)/len(scores) for topic, scores in topic_scores.items()}
    weakest = min(avg_scores, key=avg_scores.get)
    return {"topic": weakest}

@router.post("/submit")
async def submit(submission: QuizSubmission):
    return {"result": await evaluate_quiz(submission)}
