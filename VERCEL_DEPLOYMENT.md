# Vercel Deployment Guide

## ⚠️ Important Note
Vercel is designed for frontend/serverless deployments. For this full-stack app with FastAPI backend and PostgreSQL, you need to deploy:
- **Frontend on Vercel**
- **Backend on Render/Railway/Heroku** (Python/FastAPI support)
- **Database on Render/Supabase/Neon** (PostgreSQL)

## Option 1: Frontend on Vercel + Backend on Render (Recommended)

### Step 1: Deploy Backend on Render

1. Go to https://dashboard.render.com/
2. Create PostgreSQL Database:
   - Click "New +" → "PostgreSQL"
   - Name: `banking-db`
   - Copy **Internal Database URL**

3. Create Web Service for Backend:
   - Click "New +" → "Web Service"
   - Connect GitHub: `https://github.com/Urmila1945/modern-digital-banking-dashboard`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   
4. Add Environment Variables:
   ```
   DATABASE_URL=<your-internal-database-url>
   JWT_SECRET_KEY=your-secret-key-min-32-chars
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=24
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=your-app-password
   SECRET_KEY=another-secret-key-32-chars
   ALGORITHM=HS256
   OTP_EXPIRY_MINUTES=15
   ```

5. Deploy and copy your backend URL (e.g., `https://your-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com/
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables in Vercel:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

5. Deploy

## Option 2: Full Stack on Render (Simpler)

Deploy everything on Render (already configured in your repo):

### Environment Variables for Render:
```
DATABASE_URL=<your-postgresql-internal-url>
JWT_SECRET_KEY=a6f0b409d0199def6a88c3e4227e3d05c7e1a958da823cb2285195e1c7af1be8
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=urmilakshirsagar1945@gmail.com
SENDER_PASSWORD=fotb nqqx hupx abap
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
OTP_EXPIRY_MINUTES=15
```

## Complete Environment Variables Reference

### Backend Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database_name

# JWT Configuration
JWT_SECRET_KEY=a6f0b409d0199def6a88c3e4227e3d05c7e1a958da823cb2285195e1c7af1be8
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-gmail-app-password

# Security Settings
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256

# OTP Settings
OTP_EXPIRY_MINUTES=15
```

### Frontend Environment Variables (.env)

```env
# API URL - Use your backend URL
VITE_API_URL=https://your-backend-url.onrender.com

# For local development
# VITE_API_URL=http://localhost:8000

# For same-domain deployment (backend serves frontend)
# VITE_API_URL=
```

## How to Get Gmail App Password

1. Go to Google Account Settings
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Use it in `SENDER_PASSWORD`

## Database URL Format

```
postgresql://username:password@host:port/database_name
```

Example:
```
postgresql://banking_user:mypassword@dpg-abc123.oregon-postgres.render.com:5432/banking_db
```

## Vercel Configuration File (vercel.json)

Create this in your `frontend` directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

## Testing After Deployment

1. Visit your Vercel URL
2. Try login with: `admin@bank.com` / `admin123`
3. Check browser console for errors
4. Verify API calls go to correct backend URL

## Troubleshooting

### CORS Errors
- Ensure backend CORS allows your Vercel domain
- Check `allow_origins` in `backend/app/main.py`

### Database Connection Failed
- Use **Internal Database URL** from Render (not External)
- Verify DATABASE_URL format is correct
- Check database is running

### Login Returns No Token
- Check backend logs in Render
- Verify JWT_SECRET_KEY is set
- Ensure database has users (admin@bank.com)

### API Calls Fail
- Verify VITE_API_URL is set correctly in Vercel
- Check backend URL is accessible
- Test backend health: `https://your-backend.onrender.com/health`

## Quick Deploy Commands

### Local Testing
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Build Frontend
```bash
cd frontend
npm run build
```

## Summary

**Recommended Setup:**
- ✅ Frontend: Vercel
- ✅ Backend: Render
- ✅ Database: Render PostgreSQL

**Environment Variables Needed:**
- Backend: 10 variables (DATABASE_URL, JWT keys, SMTP settings)
- Frontend: 1 variable (VITE_API_URL)

**Total Cost:** FREE (using free tiers)
