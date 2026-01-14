# Deployment Guide - Fixed Network Errors

## Problem Solved
The frontend was trying to connect to a non-existent backend URL causing ERR_NAME_NOT_RESOLVED errors.

## Solution Implemented
Changed architecture to serve frontend and backend together from a single server.

## Changes Made

### 1. API Configuration
- **frontend/src/api/client.js**: Uses relative URLs (empty base URL)
- **frontend/.env**: Set `VITE_API_URL=` (empty for relative paths)
- **frontend/.env.production**: Set `VITE_API_URL=` (empty for relative paths)

### 2. Backend Updates
- **backend/app/main.py**: Added static file serving for frontend
- **backend/requirements.txt**: Added aiofiles for static files

### 3. Build Process
- **Procfile**: Builds frontend, then starts backend
- **build.sh / build.bat**: Manual build scripts

## Deployment to Render

### Option 1: Web Service (Recommended)
1. Go to Render Dashboard
2. Create New Web Service
3. Connect your GitHub repo: `https://github.com/Urmila1945/modern-digital-banking-dashboard`
4. Configure:
   - **Name**: modern-banking-dashboard
   - **Environment**: Python
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Add Environment Variables**:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET_KEY`: Your JWT secret
     - `SMTP_SERVER`: smtp.gmail.com
     - `SMTP_PORT`: 587
     - `SENDER_EMAIL`: Your email
     - `SENDER_PASSWORD`: Your app password

### Option 2: Using Procfile
The Procfile is already configured. Just push to GitHub and Render will use it automatically.

## Local Testing

### Build and Run Locally
```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Start backend (serves frontend too)
cd backend
python -m uvicorn app.main:app --reload
```

Access at: http://localhost:8000

## How It Works
1. Frontend builds to `frontend/dist`
2. Backend serves static files from `frontend/dist`
3. API calls use relative paths (e.g., `/api/auth/login`)
4. Single domain = no CORS issues, no separate backend URL needed

## Testing After Deployment
1. Visit your Render URL (e.g., https://your-app.onrender.com)
2. Frontend should load
3. Login should work without network errors
4. All API calls go to same domain

## Troubleshooting

### If you still get network errors:
1. Check Render logs for build errors
2. Ensure frontend/dist exists after build
3. Verify DATABASE_URL is set in Render environment
4. Check that all environment variables are configured

### Database Setup
You need a PostgreSQL database. On Render:
1. Create a PostgreSQL database
2. Copy the Internal Database URL
3. Set it as DATABASE_URL in your web service environment variables