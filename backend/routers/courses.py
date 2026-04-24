import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
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
