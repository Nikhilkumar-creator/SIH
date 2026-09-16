@echo off
title NCPOR Icebound Portal Launcher
echo Launching Icebound Backend and Frontend...
echo.
start "Icebound Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"
start "Icebound Frontend" cmd /k "cd frontend && npx vite --force"
echo Services active!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
pause
