@echo off
echo ========================================
echo   MODERN DIGITAL BANKING DASHBOARD
echo ========================================
echo.
echo Starting Complete Banking System...
echo.

REM Setup backend
echo [1/3] Setting up backend database...
cd backend
python setup_complete_system.py
if %errorlevel% neq 0 (
    echo Error setting up backend!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
start "Banking Backend" cmd /k "python start_server.py"

REM Wait for backend to start
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting frontend...
cd ..\frontend
start "Banking Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   BANKING SYSTEM DEPLOYED SUCCESSFULLY
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Login Credentials:
echo Admin: admin@bank.com / admin123
echo User: user@bank.com / user123
echo.
echo All registered users can login with their credentials
echo.
echo Press any key to exit...
pause > nul