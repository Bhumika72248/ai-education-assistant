import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models.schemas import LearningPath, LearningPathGenerateRequest, LearningPathUpdateRequest, User
from routers.auth import get_current_user
from datetime import datetime
import google.generativeai as genai

router = APIRouter()

GEMINI_MODEL = "gemini-flash-latest"

def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json",
        )
    )

def extract_json_from_response(text: str) -> dict:
    """Safely extracts JSON from LLM response, stripping markdown if present."""
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    text = text.strip()
    return json.loads(text)

SYSTEM_PROMPT = """You are an expert learning path designer and technical mentor.
Based on the following user input, create a highly personalized, structured learning roadmap.

{context}

Return a valid JSON object ONLY with this exact structure:
{{
  "goal": "Clear summary of the main goal",
  "total_duration_days": 14,
  "daily_hours": 2.0,
  "weeks": [
    {{
      "week_number": 1,
      "milestone": "Short description of what will be achieved this week",
      "days": [
        {{
          "day_number": 1,
          "offset_days": 0,
          "tasks": [
            {{
              "id": "w1d1t1",
              "topic_name": "Introduction to the Topic",
              "task_type": "learn",
              "estimated_minutes": 60,
              "difficulty": "easy",
              "youtube_query": "specific tutorial search query for YouTube",
              "completed": false
            }}
          ]
        }}
      ]
    }}
  ]
}}

Rules:
- task_type MUST be one of: learn, practice, revise, quiz
- difficulty MUST be one of: easy, medium, hard
- Strictly respect the user's daily hours constraint (estimated_minutes per day should add up to daily_hours * 60)
- Use unique task ids like w1d1t1, w1d2t1, w2d1t1, etc.
- Keep the plan realistic and achievable
- youtube_query should be a specific search term like "React hooks tutorial for beginners 2024"
- Include at least 2-3 tasks per day
- Generate 1-4 weeks based on the complexity and deadline
"""

@router.post("/generate")
async def generate_path(
    req: LearningPathGenerateRequest, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    model = get_gemini_model()
    
    if req.mode == "prompt" and req.prompt:
        context_str = f"User's free text description:\n{req.prompt}"
    elif req.mode == "guided" and req.answers:
        context_str = f"User's guided answers:\n{json.dumps(req.answers, indent=2)}"
    else:
        raise HTTPException(status_code=400, detail="Must provide prompt or answers")

    if req.settings:
        context_str += f"\n\nAdditional Constraints/Settings:\n{json.dumps(req.settings, indent=2)}"

    full_prompt = SYSTEM_PROMPT.format(context=context_str)
    
    attempts = 2
    last_error = None
    
    for attempt in range(attempts):
        try:
            print(f"Attempt {attempt + 1}: Calling Gemini ({GEMINI_MODEL}) for learning path...")
            response = model.generate_content(full_prompt)
            
            # Check if response has text content
            if not response.candidates:
                raise ValueError("Gemini returned no candidates. This may be a safety block.")
            
            candidate = response.candidates[0]
            if candidate.finish_reason.name not in ("STOP", "MAX_TOKENS"):
                raise ValueError(f"Gemini stopped with reason: {candidate.finish_reason.name}")
            
            raw_text = response.text
            print(f"Got response from Gemini ({len(raw_text)} chars)")
            
            path_dict = extract_json_from_response(raw_text)
            
            if "weeks" not in path_dict or not path_dict["weeks"]:
                raise ValueError("Invalid path structure: missing 'weeks' array")
            
            print(f"Successfully parsed JSON with {len(path_dict.get('weeks', []))} weeks")
            
            # Save or update in DB using authenticated user's ID
            user_id = current_user.id
            existing_path = session.exec(select(LearningPath).where(LearningPath.user_id == user_id)).first()
            
            if existing_path:
                existing_path.goal = path_dict.get("goal", "Learning Path")
                existing_path.total_duration_days = path_dict.get("total_duration_days", 30)
                existing_path.daily_hours = path_dict.get("daily_hours", 1.0)
                existing_path.path_data = json.dumps(path_dict)
                existing_path.updated_at = datetime.utcnow()
                session.add(existing_path)
            else:
                new_path = LearningPath(
                    user_id=user_id,
                    goal=path_dict.get("goal", "Learning Path"),
                    total_duration_days=path_dict.get("total_duration_days", 30),
                    daily_hours=path_dict.get("daily_hours", 1.0),
                    path_data=json.dumps(path_dict)
                )
                session.add(new_path)
            
            session.commit()
            print(f"Learning path saved to database for user_id={user_id}")
            return path_dict

        except Exception as e:
            last_error = str(e)
            print(f"Attempt {attempt + 1} failed: {last_error}")
            if attempt < attempts - 1:
                print("Retrying without response_mime_type constraint...")
                # Retry with plain model (no JSON mime type)
                genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
                model = genai.GenerativeModel(GEMINI_MODEL)
            else:
                raise HTTPException(
                    status_code=422,
                    detail=f"Failed to generate learning path: {last_error}"
                )

@router.get("/me")
async def get_my_path(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    existing_path = session.exec(select(LearningPath).where(LearningPath.user_id == user_id)).first()
    if not existing_path:
        return {"has_path": False}
    return {
        "has_path": True,
        "path_data": json.loads(existing_path.path_data),
        "updated_at": existing_path.updated_at
    }

@router.put("/update")
async def update_path(
    req: LearningPathUpdateRequest, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    existing_path = session.exec(select(LearningPath).where(LearningPath.user_id == user_id)).first()
    if not existing_path:
        raise HTTPException(status_code=404, detail="Path not found")
    
    try:
        json.loads(req.path_data)  # Validate JSON
        existing_path.path_data = req.path_data
        existing_path.updated_at = datetime.utcnow()
        session.add(existing_path)
        session.commit()
        print(f"Learning path updated for user_id={user_id}")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid path data: {str(e)}")
