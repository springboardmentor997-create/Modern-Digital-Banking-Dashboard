# URGENT FIX: Deploy Backend First

## Problem
You deployed frontend on Vercel WITHOUT deploying the backend. The API calls have nowhere to go (404 errors).

## Solution: Deploy Backend on Render NOW

### Step 1: Deploy Backend (10 minutes)

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub: https://github.com/Urmila1945/modern-digital-banking-dashboard
4. Configure:
   ```
   Name: banking-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. Add Environment Variables (click "Advanced"):
   ```
   DATABASE_URL=postgresql://banking_db_aobk_user:qtJOmQ67VfUD9bYrkQammmkioOSz1IRr@dpg-d5fp2ptactks739purlg-a/banking_db_aobk
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

6. Click "Create Web Service"
7. Wait for deployment (5-10 min)
8. **COPY YOUR BACKEND URL** (e.g., `https://banking-backend-xyz.onrender.com`)

### Step 2: Update Vercel Frontend

1. Go to https://vercel.com/dashboard
2. Find your project: `bankingdashboard`
3. Go to Settings → Environment Variables
4. Add new variable:
   ```
   Key: VITE_API_URL
   Value: https://your-backend-url.onrender.com (from Step 1)
   ```
5. Go to Deployments → Click "..." → Redeploy

### Step 3: Test

1. Wait for Vercel redeploy (2-3 min)
2. Visit: https://bankingdashboard-gamma.vercel.app
3. Try signup/login
4. Should work now!

## Quick Test Backend

After deploying backend, test it:
```
https://your-backend-url.onrender.com/health
```

Should return:
```json
{"status": "healthy", "timestamp": "...", "database": "connected"}
```

## Alternative: Deploy Everything on Render (Simpler)

Instead of Vercel + Render, deploy BOTH on Render:

1. Deploy backend (as above)
2. Deploy frontend on Render:
   - New Web Service
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`
   - Add env: `VITE_API_URL=https://your-backend-url.onrender.com`

## Current Issue Summary

❌ Frontend deployed on Vercel: https://bankingdashboard-gamma.vercel.app
❌ Backend NOT deployed anywhere
❌ API calls fail with 404

✅ Solution: Deploy backend on Render first
✅ Then update Vercel with backend URL
