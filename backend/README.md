# Backend — Modern Digital Banking Dashboard

This folder contains the FastAPI backend for the project.

Quick setup (Windows - PowerShell)

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run locally (development):

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Notes
- Default DB: SQLite at `backend/banking.db` (no external DB needed for development).
- Environment variables may be placed in `backend/.env`. See `app/config.py` for available settings.

Common tasks
- Create the virtual environment: `python -m venv .venv`
- Run database table creation is performed automatically on startup via `Base.metadata.create_all`.
