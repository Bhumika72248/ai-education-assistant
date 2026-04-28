import os
import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

PATH_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a personalized learning coach. Respond only with valid JSON."),
    ("human", """Based on this student's quiz performance, generate a 7-day learning plan.

Quiz History Summary:
{history_summary}

Strong Topics: {strong_topics}
Weak Topics: {weak_topics}
Average Score: {avg_score}%

Return ONLY this JSON:
{{
  "weekly_goal": "...",
  "days": [
    {{
      "day": 1,
      "focus": "Topic name",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "estimated_time": "45 mins",
      "resources": ["Resource 1"]
    }}
  ]
}}""")
])


def generate_learning_path(history_summary: str, strong: list, weak: list, avg_score: float) -> dict:
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.5,
    )
    chain = PATH_PROMPT | llm
    try:
        result = chain.invoke({
            "history_summary": history_summary,
            "strong_topics": ", ".join(strong) or "None identified yet",
            "weak_topics": ", ".join(weak) or "None identified yet",
            "avg_score": round(avg_score, 1),
        })
        text = result.content.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except Exception as e:
        # Fallback: create a simple deterministic 7-day plan
        days = []
        topics_pool = weak if weak else (strong if strong else [history_summary or "General"])
        for i in range(7):
            topic = topics_pool[i % len(topics_pool)]
            tasks = [
                f"Review key concepts of {topic}",
                f"Practice 10 questions on {topic}",
                f"Watch a short tutorial on {topic}",
            ]
            days.append({
                "day": i + 1,
                "focus": topic,
                "tasks": tasks,
                "estimated_time": "45 mins",
                "resources": [f"Search: {topic} tutorial", "Article: official docs"],
            })
        return {
            "weekly_goal": f"Focus on: {', '.join(topics_pool[:3])}",
            "days": days,
            "note": f"Generated fallback plan due to error: {e}",
        }
