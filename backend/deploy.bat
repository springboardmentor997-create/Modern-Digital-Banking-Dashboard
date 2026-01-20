@echo off
echo Deploying Flask backend to GitHub...

cd /d "c:\Users\URMILA\Downloads\frontend (5)\frontend\backend"

echo Adding files to git...
git add .
git commit -m "Fix backend login API - switch to Flask"
git push origin main

echo.
echo Deployment files updated!
echo.
echo Test credentials:
echo - admin@bank.com / test123
echo - user@bank.com / test123  
echo - test@test.com / test123
echo.
echo The backend should now work at: https://your-backend-url.onrender.com
pause