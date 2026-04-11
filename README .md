# EduAI — AI-Powered Education Assistant

> Hackathon Project | React + Tailwind · FastAPI · LangChain · Gemini API · FAISS

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature List](#2-feature-list)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Prerequisites](#6-prerequisites)
7. [Environment Setup](#7-environment-setup)
8. [Backend Setup (FastAPI)](#8-backend-setup-fastapi)
9. [Frontend Setup (React + Tailwind)](#9-frontend-setup-react--tailwind)
10. [AI & RAG Pipeline Setup](#10-ai--rag-pipeline-setup)
11. [Database Setup](#11-database-setup)
12. [Running the Project](#12-running-the-project)
13. [API Reference](#13-api-reference)
14. [Module-by-Module Implementation Guide](#14-module-by-module-implementation-guide)
    - [14.1 RAG Doubt Solver](#141-rag-doubt-solver)
    - [14.2 AI Quiz Generator](#142-ai-quiz-generator)
    - [14.3 Assignment Evaluator](#143-assignment-evaluator)
    - [14.4 Personalized Learning Path](#144-personalized-learning-path)
    - [14.5 AI Study Notes Generator](#145-ai-study-notes-generator)
    - [14.6 Voice Assistant](#146-voice-assistant)
    - [14.7 Emotion / Engagement Detector](#147-emotion--engagement-detector)
    - [14.8 Analytics Dashboard](#148-analytics-dashboard)
15. [Frontend Pages & Components](#15-frontend-pages--components)
16. [Deployment](#16-deployment)
17. [Demo Script](#17-demo-script)
18. [Folder Checklist](#18-folder-checklist)

---

## 1. Project Overview

EduAI is a full-stack AI-powered education assistant built for students and teachers. It combines Retrieval-Augmented Generation (RAG), LangChain agents, and Gemini LLM to deliver:

- A personal AI tutor that answers doubts from uploaded course material
- Automatic quiz generation on any topic
- AI-graded assignment evaluation with rubric-based scoring
- Personalized weekly learning paths based on student performance
- AI-generated structured study notes
- Voice-based interaction (speak your doubts, hear the answers)
- Real-time engagement detection via webcam
- Teacher-facing analytics dashboard with Chart.js visualizations

---

## 2. Feature List

### Core Features (required by problem statement)

| Feature | Description |
|---|---|
| Course & tutorial recommender | Suggests resources based on student's weak areas |
| AI doubt solver | RAG over uploaded PDFs — grounded, cited answers |
| Auto quiz generator | LLM generates MCQ/short-answer quizzes per topic |
| Student performance analytics | Charts showing scores, streaks, weak subjects |
| AI tutor (LLM-based) | Conversational tutor with memory per session |
| Personalized learning path | Weekly plan generated from quiz history |
| AI study notes | Structured notes with headings, key points, summary |
| Assignment evaluator | Rubric-based AI grading with detailed feedback |
| Voice assistant | Speech-to-text input + text-to-speech output |

### Bonus / Differentiator Features

| Feature | Why It Wins |
|---|---|
| Emotion / engagement detector | MediaPipe webcam model — no team will have this |
| Streaming LLM responses | Typing effect via SSE — feels alive |
| PDF export of notes | Tangible output judges can take away |
| Teacher dashboard | Shows real-world deployment thinking |
| Peer doubt forum (AI-moderated) | Collaborative + AI hybrid — impressive scope |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React + Tailwind                      │
│  Dashboard │ AI Chat │ Quiz │ Analytics │ Voice │ Notes  │
└─────────────────────┬───────────────────────────────────┘
                      │ REST / SSE
┌─────────────────────▼───────────────────────────────────┐
│                    FastAPI Backend                       │
│  /chat  │  /quiz  │  /analytics  │  /assignment  │ /auth │
└─────────────────────┬───────────────────────────────────┘
                      │ Python calls
┌─────────────────────▼───────────────────────────────────┐
│                  LangChain AI Layer                      │
│  RAG Pipeline │ Quiz Agent │ Eval Agent │ Path Planner   │
│                    Gemini 1.5 Flash API                  │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
┌──────────▼──────────┐   ┌───────────▼──────────────────┐
│   FAISS Vector DB   │   │      SQLite Database          │
│  (course embeddings)│   │  users, quizzes, scores, chat │
└─────────────────────┘   └──────────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | FastAPI, Uvicorn, Python 3.11+ |
| LLM | Google Gemini 1.5 Flash (via `google-generativeai`) |
| AI Framework | LangChain, LangChain-Google-GenAI |
| Embeddings | `text-embedding-004` (Gemini) or `text-embedding-3-small` (OpenAI) |
| Vector DB | FAISS (local, `faiss-cpu`) |
| Database | SQLite with SQLModel (can swap to PostgreSQL) |
| PDF parsing | PyMuPDF (`fitz`) |
| Charts | Chart.js via `react-chartjs-2` |
| Voice | Web Speech API (browser-native, no cost) |
| Engagement | MediaPipe FaceMesh (runs in browser via WASM) |
| PDF export | jsPDF + html2canvas |
| Auth | JWT with `python-jose`, `passlib` |

---

## 5. Project Structure

```
eduai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── db.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── quiz.py
│   │   ├── analytics.py
│   │   └── assignments.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── tutor_agent.py
│   │   ├── quiz_agent.py
│   │   ├── eval_agent.py
│   │   └── path_agent.py
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── ingest.py
│   │   └── retriever.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py
│   └── data/
│       ├── faiss_index/
│       └── uploads/
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Chat.jsx
│       │   ├── Quiz.jsx
│       │   ├── Analytics.jsx
│       │   ├── Notes.jsx
│       │   ├── Assignment.jsx
│       │   └── Teacher.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ChatWindow.jsx
│       │   ├── ChatMessage.jsx
│       │   ├── QuizCard.jsx
│       │   ├── QuizResult.jsx
│       │   ├── PerformanceChart.jsx
│       │   ├── VoiceButton.jsx
│       │   ├── EngagementMeter.jsx
│       │   ├── NoteViewer.jsx
│       │   └── FileUpload.jsx
│       └── hooks/
│           ├── useChat.js
│           ├── useVoice.js
│           ├── useQuiz.js
│           └── useEngagement.js
│
└── README.md
```

---

## 6. Prerequisites

Make sure you have the following installed before starting:

- Python 3.11 or higher — `python --version`
- Node.js 18 or higher — `node --version`
- npm 9+ or pnpm — `npm --version`
- Git — `git --version`
- A Google AI Studio API key (free at [https://aistudio.google.com](https://aistudio.google.com))

---

## 7. Environment Setup

Clone the repository and create your environment files.

```bash
git clone https://github.com/your-username/eduai.git
cd eduai
```

Create `backend/.env`:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (optional fallback)
OPENAI_API_KEY=your_openai_api_key_here

# JWT Auth
SECRET_KEY=your_super_secret_jwt_key_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./eduai.db

# FAISS index path
FAISS_INDEX_PATH=./data/faiss_index
UPLOADS_PATH=./data/uploads

# CORS (for local dev)
FRONTEND_URL=http://localhost:5173
```

---

## 8. Backend Setup (FastAPI)

### Step 1 — Create virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### Step 2 — Install dependencies

Create `backend/requirements.txt`:

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
sqlmodel==0.0.19
aiosqlite==0.20.0

# AI / LangChain
langchain==0.2.0
langchain-google-genai==1.0.5
langchain-community==0.2.0
google-generativeai==0.5.4
openai==1.30.0

# Vector DB & embeddings
faiss-cpu==1.8.0
langchain-text-splitters==0.2.0

# PDF parsing
pymupdf==1.24.3

# Utilities
python-dotenv==1.0.1
pydantic==2.7.1
httpx==0.27.0
```

```bash
pip install -r requirements.txt
```

### Step 3 — Create `backend/main.py`

```python
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
```

### Step 4 — Create `backend/db.py`

```python
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eduai.db")
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

### Step 5 — Create `backend/models/schemas.py`

```python
from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
import json

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    role: str = "student"   # "student" or "teacher"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role: str          # "user" or "assistant"
    content: str
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    topic: str
    score: float
    total: int
    questions_json: str   # JSON string of full attempt
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    student_answer: str
    ai_score: Optional[float] = None
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Pydantic request/response models
class ChatRequest(SQLModel):
    message: str
    session_id: str = "default"

class QuizRequest(SQLModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "medium"   # easy | medium | hard

class AssignmentRequest(SQLModel):
    title: str
    student_answer: str
    rubric: Optional[str] = None
```

---

## 9. Frontend Setup (React + Tailwind)

### Step 1 — Create Vite project

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 2 — Install dependencies

```bash
npm install \
  react-router-dom \
  axios \
  react-chartjs-2 chart.js \
  jspdf html2canvas \
  react-markdown \
  react-hot-toast \
  lucide-react \
  @mediapipe/face_mesh \
  @mediapipe/camera_utils
```

### Step 3 — Install and configure Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
      },
    },
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4 — Create `src/api/client.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Step 5 — Create `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Analytics from "./pages/Analytics";
import Notes from "./pages/Notes";
import Assignment from "./pages/Assignment";
import Teacher from "./pages/Teacher";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <div className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/assignment" element={<Assignment />} />
                  <Route path="/teacher" element={<Teacher />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 10. AI & RAG Pipeline Setup

### `backend/rag/ingest.py`

This module handles PDF ingestion — parsing, chunking, embedding, and storing in FAISS.

```python
import fitz  # PyMuPDF
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

FAISS_PATH = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index")

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    return "\n".join(page.get_text() for page in doc)

def ingest_document(pdf_path: str, doc_name: str):
    """Parse PDF, chunk it, embed, and save/update FAISS index."""
    raw_text = extract_text_from_pdf(pdf_path)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunks = splitter.create_documents(
        [raw_text],
        metadatas=[{"source": doc_name}]
    )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )

    index_file = os.path.join(FAISS_PATH, "index.faiss")
    if os.path.exists(index_file):
        db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
        db.add_documents(chunks)
    else:
        db = FAISS.from_documents(chunks, embeddings)

    db.save_local(FAISS_PATH)
    return len(chunks)
```

### `backend/rag/retriever.py`

```python
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()
FAISS_PATH = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index")

def get_retriever(k: int = 5):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    return db.as_retriever(search_kwargs={"k": k})
```

---

## 11. Database Setup

The database is created automatically on first run via `create_db_and_tables()` in `lifespan`. No manual migration needed for SQLite.

To reset the database during development:

```bash
cd backend
rm -f eduai.db
python -c "from db import create_db_and_tables; create_db_and_tables(); print('DB created')"
```

---

## 12. Running the Project

### Start the backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. View auto-generated docs at `http://localhost:8000/docs`.

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will be live at `http://localhost:5173`.

### Both at once (optional)

Install `concurrently` at the root level:

```bash
npm init -y
npm install -D concurrently
```

Add to root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && uvicorn main:app --reload --port 8000\" \"cd frontend && npm run dev\""
  }
}
```

Then run `npm run dev` from the root.

---

## 13. API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login, returns JWT token |
| GET | `/auth/me` | Get current user profile |

### Chat / Doubt Solver

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/ask` | Ask a doubt (RAG-powered, streaming) |
| POST | `/chat/upload` | Upload a PDF for ingestion |
| GET | `/chat/history/{session_id}` | Get chat history |

### Quiz

| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/generate` | Generate a quiz for a topic |
| POST | `/quiz/submit` | Submit answers, get score |
| GET | `/quiz/history` | Get all past quiz attempts |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/me` | Student's performance summary |
| GET | `/analytics/class` | Class-wide stats (teacher only) |

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/assignment/evaluate` | Submit assignment for AI grading |
| GET | `/assignment/history` | Past assignments + scores |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/notes` | Generate structured study notes for a topic |

---

## 14. Module-by-Module Implementation Guide

### 14.1 RAG Doubt Solver

**File:** `backend/agents/tutor_agent.py`

```python
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from rag.retriever import get_retriever
from dotenv import load_dotenv

load_dotenv()

TUTOR_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are EduAI, a helpful and encouraging AI tutor.
Use the following course material to answer the student's question.
If the answer is not in the material, say so honestly and give a general answer.
Always explain step by step. End with a follow-up question to check understanding.

Course Material:
{context}

Student Question: {question}

Your Answer:"""
)

def get_tutor_chain():
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3,
        streaming=True,
    )
    retriever = get_retriever(k=5)
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type_kwargs={"prompt": TUTOR_PROMPT},
        return_source_documents=True,
    )
```

**File:** `backend/routers/chat.py` (streaming endpoint)

```python
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from db import get_session
from models.schemas import ChatRequest, ChatMessage, User
from agents.tutor_agent import get_tutor_chain
from rag.ingest import ingest_document
import os, shutil, uuid

router = APIRouter()

@router.post("/ask")
async def ask_question(req: ChatRequest, session: Session = Depends(get_session)):
    chain = get_tutor_chain()

    def token_stream():
        for chunk in chain.stream({"query": req.message}):
            if "result" in chunk:
                yield chunk["result"]

    return StreamingResponse(token_stream(), media_type="text/event-stream")

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    upload_dir = os.getenv("UPLOADS_PATH", "./data/uploads")
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    chunks = ingest_document(file_path, file.filename)
    return {"message": f"Ingested {chunks} chunks from {file.filename}"}
```

---

### 14.2 AI Quiz Generator

**File:** `backend/agents/quiz_agent.py`

```python
import os, json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
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
        model="gemini-1.5-flash",
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
```

---

### 14.3 Assignment Evaluator

**File:** `backend/agents/eval_agent.py`

```python
import os, json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
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
        model="gemini-1.5-flash",
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
```

---

### 14.4 Personalized Learning Path

**File:** `backend/agents/path_agent.py`

```python
import os, json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
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
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.5,
    )
    chain = PATH_PROMPT | llm
    result = chain.invoke({
        "history_summary": history_summary,
        "strong_topics": ", ".join(strong) or "None identified yet",
        "weak_topics": ", ".join(weak) or "None identified yet",
        "avg_score": round(avg_score, 1),
    })
    text = result.content.strip().replace("```json", "").replace("```", "")
    return json.loads(text)
```

---

### 14.5 AI Study Notes Generator

Add this endpoint to `backend/routers/chat.py`:

```python
@router.post("/notes")
async def generate_notes(topic: str):
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.4,
    )
    prompt = f"""Generate comprehensive study notes on: "{topic}"

Structure them as:
# {topic}
## Overview
## Key Concepts
## Detailed Explanation
## Examples
## Common Mistakes
## Summary
## Practice Questions

Use clear headings, bullet points, and simple language. Be thorough."""

    def stream():
        for chunk in llm.stream(prompt):
            yield chunk.content

    return StreamingResponse(stream(), media_type="text/plain")
```

On the frontend, render the streamed markdown with `react-markdown` and add a "Download PDF" button using `jsPDF`.

---

### 14.6 Voice Assistant

**File:** `frontend/src/hooks/useVoice.js`

```js
import { useState, useCallback } from "react";

export function useVoice({ onTranscript }) {
  const [listening, setListening] = useState(false);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice not supported in this browser. Use Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => onTranscript(e.results[0][0].transcript);
    recognition.start();
  }, [onTranscript]);

  const speak = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { listening, startListening, speak };
}
```

**File:** `frontend/src/components/VoiceButton.jsx`

```jsx
import { useVoice } from "../hooks/useVoice";

export default function VoiceButton({ onTranscript }) {
  const { listening, startListening } = useVoice({ onTranscript });

  return (
    <button
      onClick={startListening}
      className={`p-3 rounded-full border transition-all ${
        listening
          ? "bg-red-100 border-red-400 animate-pulse"
          : "bg-white border-gray-300 hover:bg-indigo-50"
      }`}
      title={listening ? "Listening..." : "Click to speak"}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z"/>
      </svg>
    </button>
  );
}
```

---

### 14.7 Emotion / Engagement Detector

**File:** `frontend/src/hooks/useEngagement.js`

```js
import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

export function useEngagement() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("active"); // "active" | "distracted" | "confused"
  const [score, setScore] = useState(100);

  useEffect(() => {
    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
    });

    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks?.length) {
        setStatus("distracted");
        setScore((s) => Math.max(0, s - 2));
        return;
      }
      // Simple gaze estimation: check if nose tip is roughly centered
      const nose = results.multiFaceLandmarks[0][1];
      const centered = nose.x > 0.3 && nose.x < 0.7 && nose.y > 0.2 && nose.y < 0.8;
      setStatus(centered ? "active" : "distracted");
      setScore((s) => centered ? Math.min(100, s + 1) : Math.max(0, s - 1));
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => { await faceMesh.send({ image: videoRef.current }); },
      width: 320, height: 240,
    });
    camera.start();

    return () => camera.stop();
  }, []);

  return { videoRef, status, score };
}
```

**File:** `frontend/src/components/EngagementMeter.jsx`

```jsx
import { useEngagement } from "../hooks/useEngagement";

export default function EngagementMeter() {
  const { videoRef, status, score } = useEngagement();

  const color = status === "active" ? "bg-green-500" : "bg-red-400";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <video ref={videoRef} className="hidden" />
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-sm w-40">
        <div className="text-gray-500 mb-1">Engagement</div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
        </div>
        <div className={`font-medium capitalize ${status === "active" ? "text-green-600" : "text-red-500"}`}>
          {status}
        </div>
      </div>
    </div>
  );
}
```

---

### 14.8 Analytics Dashboard

**File:** `frontend/src/pages/Analytics.jsx`

```jsx
import { useEffect, useState } from "react";
import { Radar, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend
} from "chart.js";
import api from "../api/client";

ChartJS.register(RadialLinearScale, PointElement, LineElement, BarElement,
  CategoryScale, LinearScale, Filler, Tooltip, Legend);

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/me").then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  const radarData = {
    labels: data.topics,
    datasets: [{
      label: "Mastery %",
      data: data.scores,
      backgroundColor: "rgba(99,102,241,0.2)",
      borderColor: "#6366f1",
      pointBackgroundColor: "#6366f1",
    }]
  };

  const lineData = {
    labels: data.dates,
    datasets: [{
      label: "Quiz Score",
      data: data.quiz_scores,
      borderColor: "#8b5cf6",
      tension: 0.4,
      fill: false,
    }]
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Your Performance</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Quizzes taken", value: data.total_quizzes },
          { label: "Average score", value: `${data.avg_score}%` },
          { label: "Day streak", value: `${data.streak} days` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-indigo-600">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-base font-medium text-gray-700 mb-3">Subject mastery</h2>
          <Radar data={radarData} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-base font-medium text-gray-700 mb-3">Score over time</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
```

---

## 15. Frontend Pages & Components

### Dashboard (`src/pages/Dashboard.jsx`)

Shows: greeting + name, today's recommended topics, streak counter, last quiz score, quick-access cards to Chat / Quiz / Notes / Assignment.

### Chat (`src/pages/Chat.jsx`)

- PDF upload button (calls `/chat/upload`)
- Chat input with voice button
- Streaming response display (reads SSE via `fetch` + `ReadableStream`)
- Message history sidebar

### Quiz (`src/pages/Quiz.jsx`)

- Topic input + difficulty selector
- Calls `/quiz/generate` on submit
- Renders `QuizCard` components one at a time
- Shows score + explanations after submission

### Notes (`src/pages/Notes.jsx`)

- Topic input
- Streams notes from `/chat/notes`
- Renders with `react-markdown`
- "Download PDF" button using `jsPDF`

### Assignment (`src/pages/Assignment.jsx`)

- Title input, large textarea for answer, optional rubric field
- Calls `/assignment/evaluate`
- Shows score, grade badge, strengths, improvements, rewrite suggestion

### Teacher (`src/pages/Teacher.jsx`)

- Class analytics from `/analytics/class`
- Bar chart of average scores by topic
- Table of students sorted by performance
- Weak topic highlights

---

## 16. Deployment

### Quick deployment for demo day (free tier)

**Backend — Railway or Render:**

1. Push `backend/` to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all `.env` variables in the Environment tab

**Frontend — Vercel:**

1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` environment variable to your Render backend URL
4. Deploy

**Update `frontend/src/api/client.js`:**

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});
```

---

## 17. Demo Script

Structure your 8-minute live demo as a story. Practice this exact flow:

**00:00 — Hook (30 sec)**
Open the student dashboard. Say: "This is EduAI — an AI tutor that knows your course material."

**00:30 — Upload & ask a doubt (90 sec)**
Upload a PDF (use a chapter from any textbook). Type a specific question from that chapter. Show the grounded, cited answer streaming in. Mention: "The AI only answers from your actual course material — no hallucinations."

**02:00 — Auto quiz (90 sec)**
Type the same topic. Set difficulty to "hard". Show the 5 questions appearing. Answer them live. Show score + AI explanations.

**03:30 — Assignment evaluation (60 sec)**
Paste a 3-paragraph sample answer. Hit Evaluate. Show the score, grade, strengths, and improvement suggestions appearing.

**04:30 — Personalized learning path (30 sec)**
Navigate to Dashboard. Show the "This week's plan" section — 7 days of tasks generated from quiz history.

**05:00 — Voice mode (30 sec)**
Click the mic button. Ask a question out loud. Show the transcript appear and the answer stream in.

**05:30 — Engagement detector (60 sec)**
Show the engagement meter in the corner. Look away from the screen — watch it drop to "distracted". Look back — it recovers. Say: "Teachers can see class-wide engagement trends."

**06:30 — Teacher dashboard (60 sec)**
Switch to teacher view. Show the radar chart of class performance. Point to the weakest topic. Say: "The teacher can assign targeted content for that topic in one click."

**07:30 — Closing (30 sec)**
"EduAI is not just a chatbot — it's a complete learning ecosystem. RAG makes it trustworthy, agents make it smart, and the engagement detector makes it the only system that knows if a student is actually learning."

---

## 18. Folder Checklist

Use this to track your build progress:

```
Setup
  [ ] Python venv created and activated
  [ ] requirements.txt installed
  [ ] .env file created with GEMINI_API_KEY
  [ ] Node dependencies installed
  [ ] Tailwind configured

Backend
  [ ] main.py with CORS and router registration
  [ ] db.py with SQLModel
  [ ] models/schemas.py with all table models
  [ ] rag/ingest.py working (test with a sample PDF)
  [ ] rag/retriever.py working (test a query)
  [ ] agents/tutor_agent.py (RAG chain)
  [ ] agents/quiz_agent.py (JSON output)
  [ ] agents/eval_agent.py (rubric scoring)
  [ ] agents/path_agent.py (weekly plan)
  [ ] routers/chat.py (upload + ask + notes)
  [ ] routers/quiz.py (generate + submit)
  [ ] routers/analytics.py (student + class)
  [ ] routers/assignments.py (evaluate + history)
  [ ] routers/auth.py (register + login)

Frontend
  [ ] App.jsx with routing
  [ ] api/client.js with interceptor
  [ ] Dashboard.jsx
  [ ] Chat.jsx with streaming
  [ ] Quiz.jsx with quiz cards
  [ ] Notes.jsx with PDF export
  [ ] Assignment.jsx with evaluation display
  [ ] Analytics.jsx with Chart.js
  [ ] Teacher.jsx
  [ ] VoiceButton component
  [ ] EngagementMeter component

Polish
  [ ] Streaming works end-to-end
  [ ] Voice input and output working in Chrome
  [ ] Engagement detector running on webcam
  [ ] PDF download from notes page
  [ ] All pages mobile-responsive
  [ ] Demo PDF uploaded and tested
  [ ] Demo script rehearsed 3+ times
```

---

## License

MIT — free to use, modify, and demo.

---

*Built for hackathon. Stack: React + FastAPI + LangChain + Gemini + FAISS.*
