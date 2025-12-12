# Modern Digital Banking Dashboard

This repository contains a FastAPI backend and a React+Vite frontend for the Modern Digital Banking Dashboard project.

Quick setup (Windows - PowerShell)

1) Backend (Python)

- Create & activate the virtual environment (from the `backend` folder):

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

- Install requirements:

```powershell
pip install -r requirements.txt
```

- Run the API (development, with auto-reload):

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Notes:
- The project defaults to SQLite (`sqlite:///./banking.db`) so no external DB is required unless you set `DATABASE_URL` in an `.env` file.
- Environment variables can be placed in `backend/.env` (see `app/config.py`).

2) Frontend (Node + Vite)

- From the `frontend` folder install dependencies and start dev server:

```powershell
Set-Location frontend
npm install
npm run dev
```

- Common Vite / Rollup native-dependency issue (Windows): if `npm run dev` fails with a rollup native module error, try:

```powershell
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm cache clean --force
npm install --no-optional
# or use yarn:
npm install -g yarn
yarn
yarn dev
```

3) Ports & CORS

- Backend default: `http://127.0.0.1:8000` (API)
- Frontend default (Vite): `http://localhost:5173` (may vary)
- CORS origins are configured in `backend/app/config.py` and include localhost ports used by Vite.

4) Pushing changes to GitHub

- This repo already has a remote and branch `Khalik-team3-backend`. To push further updates:

```powershell
# from repo root
git checkout Khalik-team3-backend
git add README.md
git commit -m "Add top-level README with setup instructions"
git push
```

- If Git prompts for credentials, provide a GitHub PAT or use a credential manager.

5) Troubleshooting & help

- If you hit dependency or runtime issues, collect these details and open an issue or contact the project maintainer:
  - Node and npm versions: `node -v`, `npm -v`
  - Python version and pip: `python -V`, `pip -V`
  - Exact error output from `npm install` or `npm run dev` and from backend start.

6) Project structure

- `backend/` — FastAPI app and Python requirements
- `frontend/` — React + Vite frontend

---
If you want, I can also update `backend/README.md` and `frontend/README.md` with shorter, component-specific instructions. Would you like that?
