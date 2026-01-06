@echo off
echo Starting Banking System Backend Deployment...

echo Building and starting services...
docker compose -f docker-compose.backend.yml up --build -d

echo Waiting for services to start...
timeout /t 30 /nobreak >nul

echo Checking service status...
docker compose -f docker-compose.backend.yml ps

echo Deployment complete!
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs

pause