@echo off
cls
echo ===============================================
echo    🏦 Banking System Docker Deployment
echo ===============================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Desktop is running
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Stop and remove existing containers
echo 📦 Stopping existing containers...
docker-compose down -v 2>nul
echo.

REM Clean up old images (optional)
echo 🧹 Cleaning up old images...
docker system prune -f >nul 2>&1
echo.

REM Build and start services
echo 🔨 Building and starting services...
echo This may take a few minutes on first run...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    echo Checking logs...
    docker-compose logs
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to initialize...
timeout /t 15 /nobreak >nul

REM Check service health
echo.
echo 🔍 Checking service status...
docker-compose ps

REM Test backend health
echo.
echo 🩺 Testing backend health...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ⚠️  Backend may still be starting...
)

REM Display access information
echo.
echo ===============================================
echo    🌐 Your Banking System is Ready!
echo ===============================================
echo.
echo 📱 Frontend (Web App):     http://localhost:5173
echo 🔧 Backend API:           http://localhost:8000
echo 📚 API Documentation:     http://localhost:8000/docs
echo 🗄️  PostgreSQL Database:   localhost:5433
echo.
echo ===============================================
echo    👤 Default Admin Account
echo ===============================================
echo.
echo Create admin user by visiting: http://localhost:5173
echo Or use API: POST http://localhost:8000/api/auth/register
echo.
echo ===============================================
echo    🛠️  Management Commands
echo ===============================================
echo.
echo View logs:           docker-compose logs
echo Stop services:       docker-compose down
echo Restart services:    docker-compose restart
echo Update services:     docker-compose up --build -d
echo.
echo ✨ Deployment completed successfully!
echo.
pause