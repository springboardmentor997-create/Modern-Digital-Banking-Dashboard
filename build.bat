@echo off
echo Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo Build complete! Frontend built to frontend/dist
echo Backend will serve the frontend from this directory
pause