@echo off
echo Starting Banking Backend Server...
cd /d "%~dp0"
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload