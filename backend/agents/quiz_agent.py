import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

QUIZ_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a quiz creator. Always respond with valid JSON only. No markdown, no preamble."),
    ("human", """Create {num_questions} multiple choice questions on the topic: "{topic}".
Difficulty: {difficulty}.

Respond ONLY with this JSON structure:
{{
  "topic": "{topic}",
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "explanation": "..."
    }}
  ]
}}""")
])


def generate_quiz(topic: str, num_questions: int = 5, difficulty: str = "medium") -> dict:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7,
    )
    chain = QUIZ_PROMPT | llm
    result = chain.invoke({
        "topic": topic,
        "num_questions": num_questions,
        "difficulty": difficulty
    })
    text = result.content.strip().replace("```json", "").replace("```", "")
    return json.loads(text)
