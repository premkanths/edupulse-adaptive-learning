@echo off
title EduPulse Launcher
color 0A

echo ==============================================================================
echo                EduPulse: AI-Powered Adaptive Learning Platform                
echo ==============================================================================
echo.
echo [1/4] Checking prerequisites...

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Python not found in PATH. ML service might fail to start.
)

where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Maven not found in standard PATH. Trying custom Maven path...
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node/NPM not found. Please install Node.js 18+.
    pause
    exit /b 1
)

echo.
echo [2/4] Starting FastAPI ML Service (Port 8001)...
start "EduPulse ML Service (Port 8001)" cmd /k "cd ml-service && python -m uvicorn main:app --host 127.0.0.1 --port 8001"

timeout /t 3 /nobreak >nul

echo [3/4] Starting Spring Boot Server (Port 8080)...
start "EduPulse Spring Boot Server (Port 8080)" cmd /k "cd backend && mvn spring-boot:run"

timeout /t 5 /nobreak >nul

echo [4/4] Starting Vite React Client (Port 5173)...
start "EduPulse Frontend Client (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ==============================================================================
echo                       EduPulse Started Successfully!                          
echo ==============================================================================
echo.
echo  Access Points:
echo  - Frontend Application:  http://localhost:5173
echo  - Backend API:           http://localhost:8080/api
echo  - Swagger Documentation: http://localhost:8080/swagger-ui.html
echo  - ML Service Health:     http://localhost:8001/health
echo.
echo  Default Test Accounts:
echo  - Student:  student1@edupulse.local        / Password@123
echo  - Teacher:  teacher.sarah@edupulse.local   / Password@123
echo  - Admin:    admin@edupulse.local          / Password@123
echo.
echo ==============================================================================
echo Opening EduPulse in your default browser...
start http://localhost:5173

pause
