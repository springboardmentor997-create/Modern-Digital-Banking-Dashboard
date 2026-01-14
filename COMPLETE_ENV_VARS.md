# Complete Environment Variables for Deployment

## Backend Environment Variables (Render/Railway)

Copy these EXACT values to your backend deployment:

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

## Frontend Environment Variables (Vercel)

Replace `YOUR_BACKEND_URL` with your actual backend URL after deploying:

```
VITE_API_URL=YOUR_BACKEND_URL
```

Example:
```
VITE_API_URL=https://modern-banking-backend.onrender.com
```

## Deployment Steps

### Step 1: Deploy Backend on Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub: https://github.com/Urmila1945/modern-digital-banking-dashboard
4. Configure:
   - **Name**: modern-banking-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   - Copy ALL variables from "Backend Environment Variables" section above
   - Paste each one individually

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://modern-banking-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import: https://github.com/Urmila1945/modern-digital-banking-dashboard
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com` (from Step 1)

6. Click "Deploy"
7. Wait for deployment (3-5 minutes)

### Step 3: Test

1. Visit your Vercel URL
2. Login with: `admin@bank.com` / `admin123`
3. Should work without errors!

## Quick Copy-Paste for Render

**Backend Environment Variables** (paste in Render dashboard):

| Key | Value |
|-----|-------|
| DATABASE_URL | postgresql://banking_db_aobk_user:qtJOmQ67VfUD9bYrkQammmkioOSz1IRr@dpg-d5fp2ptactks739purlg-a/banking_db_aobk |
| JWT_SECRET_KEY | a6f0b409d0199def6a88c3e4227e3d05c7e1a958da823cb2285195e1c7af1be8 |
| JWT_ALGORITHM | HS256 |
| JWT_EXPIRATION_HOURS | 24 |
| SMTP_SERVER | smtp.gmail.com |
| SMTP_PORT | 587 |
| SENDER_EMAIL | urmilakshirsagar1945@gmail.com |
| SENDER_PASSWORD | fotb nqqx hupx abap |
| SECRET_KEY | 09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7 |
| ALGORITHM | HS256 |
| OTP_EXPIRY_MINUTES | 15 |

## Troubleshooting

### If login fails:
1. Check backend logs in Render
2. Verify DATABASE_URL is correct
3. Ensure all environment variables are set
4. Check backend URL is accessible: `https://your-backend.onrender.com/health`

### If frontend can't connect:
1. Verify VITE_API_URL in Vercel matches your backend URL
2. Check CORS is enabled in backend
3. Test backend directly: `https://your-backend.onrender.com/api/health`

## Default Login Credentials

After deployment, login with:
- **Admin**: admin@bank.com / admin123
- **User**: user@bank.com / user123
- **Test**: test@test.com / test123

These accounts are created automatically on first backend startup.
