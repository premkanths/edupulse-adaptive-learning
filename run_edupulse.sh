#!/usr/bin/env bash

# EduPulse Launch Script for Linux and macOS

echo "=============================================================================="
echo "               EduPulse: AI-Powered Adaptive Learning Platform                "
echo "=============================================================================="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "[WARNING] python3 not found. ML service may fail."; }
command -v mvn >/dev/null 2>&1 || { echo "[ERROR] mvn not found. Please install Apache Maven."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm not found. Please install Node.js 18+."; exit 1; }

echo "[1/3] Starting FastAPI ML Service (Port 8001)..."
(cd ml-service && python3 -m uvicorn main:app --host 127.0.0.1 --port 8001) &
PID_ML=$!

echo "[2/3] Starting Spring Boot Server (Port 8080)..."
(cd backend && mvn spring-boot:run) &
PID_SERVER=$!

echo "[3/3] Starting React Client (Port 5173)..."
(cd frontend && npm run dev) &
PID_CLIENT=$!

echo ""
echo "=============================================================================="
echo "                      EduPulse Started Successfully!                          "
echo "=============================================================================="
echo ""
echo " Access Points:"
echo " - Frontend Application:  http://localhost:5173"
echo " - Backend API:           http://localhost:8080/api"
echo " - Swagger Documentation: http://localhost:8080/swagger-ui.html"
echo " - ML Service Health:     http://localhost:8001/health"
echo ""
echo " Default Test Accounts:"
echo " - Student:  student1@edupulse.local        / Password@123"
echo " - Teacher:  teacher.sarah@edupulse.local   / Password@123"
echo " - Admin:    admin@edupulse.local          / Password@123"
echo ""
echo "Press Ctrl+C to terminate all services."

trap "kill $PID_ML $PID_SERVER $PID_CLIENT 2>/dev/null; exit" SIGINT SIGTERM
wait
