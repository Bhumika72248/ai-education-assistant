from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from db import create_db_and_tables
from routers import auth, chat, quiz, analytics, assignments, courses, materials
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    os.makedirs(os.getenv("FAISS_INDEX_PATH", "./data/faiss_index"), exist_ok=True)
    uploads = os.getenv("UPLOADS_PATH", "./data/uploads")
    os.makedirs(uploads, exist_ok=True)
    yield

app = FastAPI(title="EduAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5174", "http://127.0.0.1:5174", os.getenv("FRONTEND_URL", "")] if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(assignments.router, prefix="/assignment", tags=["assignments"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(materials.router, prefix="/materials", tags=["materials"])

from fastapi.staticfiles import StaticFiles
app.mount("/materials/file", StaticFiles(directory=os.getenv("UPLOADS_PATH", "./data/uploads")), name="uploads")

@app.get("/health")
def health():
    return {"status": "ok", "service": "EduAI"}
