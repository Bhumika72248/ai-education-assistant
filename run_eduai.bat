@echo off
echo.
echo =====================================================
echo   EduAI - AI Education Assistant
echo =====================================================
echo.

:: ── Backend (FastAPI + uvicorn) ──────────────────────
echo [1/2] Starting Backend on http://localhost:8000 ...
start "EduAI Backend" cmd /k "cd /d d:\AI-Tutor\ai-education-assistant\backend && python -m uvicorn main:app --reload --port 8000"

:: Give backend a moment to bind
timeout /t 3 /nobreak >nul

:: ── Frontend (Vite + React) ───────────────────────────
echo [2/2] Starting Frontend on http://localhost:5173 ...
start "EduAI Frontend" cmd /k "cd /d d:\AI-Tutor\ai-education-assistant\frontend && npm.cmd run dev -- --port 5173"

:: Wait for Vite to boot
timeout /t 4 /nobreak >nul

echo.
echo =====================================================
echo   Both servers are starting up:
echo.
echo   Frontend  →  http://localhost:5173
echo   Backend   →  http://localhost:8000
echo   API Docs  →  http://localhost:8000/docs
echo.
echo   Login / Register at: http://localhost:5173/login
echo   Student Portal     : http://localhost:5173/student
echo   Teacher Portal     : http://localhost:5173/teacher
echo =====================================================
echo.
echo   Close the two opened command windows to stop.
echo.
pause
