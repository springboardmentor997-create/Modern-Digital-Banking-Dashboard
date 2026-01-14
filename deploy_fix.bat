@echo off
echo Committing deployment fixes to GitHub...

cd /d "c:\Users\URMILA\Downloads\frontend (5)\frontend"

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix: Update API configuration for production deployment

- Updated .env to use production backend URL
- Fixed client.js fallback URL for deployment
- Updated Procfile to use FastAPI with uvicorn
- Added proper requirements.txt for backend
- Enhanced vite.config.js for production builds
- Created .env.production for deployment

Fixes network error: Backend server connection issue resolved"

echo Pushing to main branch...
git push origin main

echo.
echo Deployment fix committed and pushed to GitHub!
echo Render will automatically redeploy with the new configuration.
echo.
pause