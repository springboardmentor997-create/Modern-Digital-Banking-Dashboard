# FIX: Backend Returning Mock Data

## Problem
Your backend at https://modern-digital-banking-dashboard-1-vg97.onrender.com is returning mock tokens instead of real data. This means it's using `pure_server.py` instead of the FastAPI app.

## Solution: Update Render Configuration

### Go to Render Dashboard

1. Visit: https://dashboard.render.com/
2. Find your service: **modern-digital-banking-dashboard-1-vg97**
3. Click on it

### Update Build & Start Commands

Click **Settings** and update:

**Build Command:**
```
cd backend && pip install -r requirements.txt
```

**Start Command:**
```
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Verify Environment Variables

Make sure these are set in **Environment** tab:

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

### Manual Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait 5-10 minutes
3. Test: https://modern-digital-banking-dashboard-1-vg97.onrender.com/api/health

Should return:
```json
{"status": "healthy", "api_version": "1.0.0", "endpoints": "active"}
```

### After Backend is Fixed

1. Go to Vercel dashboard
2. Your project: **bankingdashboard**
3. **Deployments** → **Redeploy**

## Quick Test Commands

Test backend health:
```bash
curl https://modern-digital-banking-dashboard-1-vg97.onrender.com/api/health
```

Test login:
```bash
curl -X POST https://modern-digital-banking-dashboard-1-vg97.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bank.com","password":"admin123"}'
```

Should return real JWT token, not "mock-token".

## Alternative: Redeploy from Scratch

If updating doesn't work:

1. Delete the current Render service
2. Create new Web Service
3. Connect GitHub repo
4. Use settings above
5. Add all environment variables
6. Deploy
