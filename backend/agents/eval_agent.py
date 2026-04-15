import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
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
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.2,
    )
    chain = EVAL_PROMPT | llm
    result = chain.invoke({
        "title": title,
        "rubric": rubric or DEFAULT_RUBRIC,
        "student_answer": student_answer,
    })
    text = result.content.strip().replace("```json", "").replace("```", "")
    return json.loads(text)
