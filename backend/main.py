from fastapi import FastAPI
from routers import chat, quiz, analytics, assignments

app = FastAPI(title="TechHack API")

app.include_router(chat.router, prefix="/chat")
app.include_router(quiz.router, prefix="/quiz")
app.include_router(analytics.router, prefix="/analytics")
app.include_router(assignments.router, prefix="/assignment")
