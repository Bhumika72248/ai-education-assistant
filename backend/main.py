from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from db import create_db_and_tables
from routers import auth, chat, quiz, analytics, assignments
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    os.makedirs(os.getenv("FAISS_INDEX_PATH", "./data/faiss_index"), exist_ok=True)
    os.makedirs(os.getenv("UPLOADS_PATH", "./data/uploads"), exist_ok=True)
    yield

app = FastAPI(title="EduAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(assignments.router, prefix="/assignment", tags=["assignments"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "EduAI"}
