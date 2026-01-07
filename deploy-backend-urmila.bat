@echo off
echo ========================================
echo   Modern Digital Banking Dashboard
echo   Backend Deployment Script (Urmila Team1)
echo ========================================
echo.
echo Repository: https://github.com/springboardmentor997-create/Modern-Digital-Banking-Dashboard/tree/Urmila-team1-backend/
echo Branch: urmila-team1-backend
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Stopping existing containers...
docker-compose down

echo.
echo [3/5] Building backend image...
docker-compose build backend

echo.
echo [4/5] Starting services...
docker-compose -f docker-compose.backend.yml up -d

echo.
echo [5/5] Checking container status...
docker-compose -f docker-compose.backend.yml ps

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Database: localhost:5433
echo.
echo Default Login Credentials:
echo Admin: admin@bank.com / admin123
echo User: user@bank.com / user123
echo Test: test@test.com / test123
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo ========================================