import os
import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

EVAL_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a strict but fair teacher. Respond only with valid JSON."),
    ("human", """Evaluate this student assignment.

Assignment Title: {title}
Rubric / Expected Answer: {rubric}
Student Answer: {student_answer}

Return ONLY this JSON:
{{
  "score": 85,
  "max_score": 100,
  "grade": "B",
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Point 1", "Point 2"],
  "detailed_feedback": "...",
  "rewrite_suggestion": "..."
}}""")
])

DEFAULT_RUBRIC = "Evaluate based on accuracy, clarity, completeness, and logical structure."


def evaluate_assignment(title: str, student_answer: str, rubric: str = None) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing in backend/.env")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=api_key,
        temperature=0.2,
    )
    chain = EVAL_PROMPT | llm
    payload = {
        "title": title,
        "rubric": rubric or DEFAULT_RUBRIC,
        "student_answer": student_answer,
    }

    try:
        result = chain.invoke(payload)
    except Exception as exc:
        raise RuntimeError(f"AI evaluation failed: {exc}") from exc

    text = result.content.strip().replace("```json", "").replace("```", "")
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("AI returned an invalid response format.") from exc
