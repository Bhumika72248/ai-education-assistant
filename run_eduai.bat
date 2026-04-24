@echo off
echo Starting EduAI Full-Stack Application...

:: Open Backend in a new window
start cmd /k "cd backend && uvicorn main:app --reload --port 8000"

:: Open Frontend in a new window
start cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ======================================================
echo Backend is running at http://localhost:8000
echo Frontend is running at http://localhost:5173
echo ======================================================
echo.
echo Close the newly opened command windows to stop the servers.
pause
