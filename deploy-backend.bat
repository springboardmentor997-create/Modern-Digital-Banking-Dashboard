@echo off
echo 🚀 Starting Banking System Backend Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Remove old images
echo 🧹 Cleaning up old images...
docker system prune -f

REM Build and start services
echo 🔨 Building and starting services...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose -f docker-compose.prod.yml ps

REM Show logs
echo 📋 Recent logs:
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ✅ Deployment complete!
echo 🌐 Backend API: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/health

pause