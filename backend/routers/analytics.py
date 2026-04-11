from fastapi import APIRouter
from db import get_student_analytics

router = APIRouter()

@router.get("/student/{student_id}")
async def student_analytics(student_id: str):
    return {"analytics": get_student_analytics(student_id)}
