# Deployment Guide - Fixed Network Errors

## Problem Solved
Fixed "Login failed - no token received" and network connection errors.

## Root Causes Fixed
1. Backend URL was hardcoded to non-existent domain
2. Database URL was hardcoded to localhost
3. Frontend and backend were not properly integrated

## Solution Implemented
- Frontend uses relative URLs to connect to backend on same domain
- Backend serves frontend static files
- Database URL uses environment variables
- Single deployment serves both frontend and backend

## Quick Deploy to Render

### Step 1: Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Name: `banking-db`
4. Database: `banking_db`
5. User: `banking_user`
6. Click "Create Database"
7. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo: `https://github.com/Urmila1945/modern-digital-banking-dashboard`
3. Configure:
   - **Name**: `modern-banking-dashboard`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main` or `urmila-team1-backend`
   - **Build Command**: 
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

### Step 3: Add Environment Variables
In the web service, add these environment variables:

```
DATABASE_URL=<paste your Internal Database URL from Step 1>
JWT_SECRET_KEY=your-secret-key-here-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)
3. Once deployed, click your service URL
4. You should see the login page

## Test Login
Use these credentials (created automatically):
- **Admin**: admin@bank.com / admin123
- **User**: user@bank.com / user123
- **Test**: test@test.com / test123

## Local Testing

### Prerequisites
- PostgreSQL running on localhost:5433
- Node.js 18+
- Python 3.11+

### Run Locally
```bash
# Terminal 1: Start PostgreSQL (if not running)
# Make sure PostgreSQL is running on port 5433

# Terminal 2: Build frontend
cd frontend
npm install
npm run build

# Terminal 3: Start backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Access at: http://localhost:8000

## Troubleshooting

### "Login failed - no token received"
**Cause**: Backend not responding or database not connected

**Solutions**:
1. Check Render logs for errors
2. Verify DATABASE_URL is set correctly
3. Ensure database is running and accessible
4. Check backend logs for connection errors

### "Network Error: Cannot connect to backend"
**Cause**: Backend not running or build failed

**Solutions**:
1. Check Render build logs
2. Verify build command completed successfully
3. Check start command is correct
4. Ensure PORT environment variable is available

### Database Connection Failed
**Cause**: DATABASE_URL incorrect or database not accessible

**Solutions**:
1. Use **Internal Database URL** (not External)
2. Verify database is running in Render
3. Check database and web service are in same region
4. Ensure connection string format is correct

### Build Fails
**Cause**: Missing dependencies or build errors

**Solutions**:
1. Check Node.js version (should be 18+)
2. Check Python version (should be 3.11+)
3. Verify all dependencies in requirements.txt
4. Check frontend/package.json for errors

## Architecture

```
User Browser
     ↓
  Render URL (https://your-app.onrender.com)
     ↓
  FastAPI Backend (serves both API and frontend)
     ├── /api/* → API endpoints
     ├── /assets/* → Frontend static files
     └── /* → Frontend index.html
     ↓
  PostgreSQL Database
```

## Files Modified
- `backend/app/database.py` - Use environment variable for DATABASE_URL
- `backend/app/main.py` - Serve frontend static files
- `backend/requirements.txt` - Added dependencies
- `frontend/src/api/client.js` - Use relative URLs
- `frontend/.env` - Empty VITE_API_URL for relative paths
- `Procfile` - Build and start commands
- `render.yaml` - Render configuration

## Success Indicators
1. ✅ Build completes without errors
2. ✅ Service shows "Live" status in Render
3. ✅ Opening service URL shows login page
4. ✅ Login with test credentials works
5. ✅ Dashboard loads after login

If all indicators pass, deployment is successful!