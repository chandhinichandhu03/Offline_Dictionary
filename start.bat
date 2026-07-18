@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo.
echo ==========================================
echo         LexiLearn Startup Script         
echo ==========================================
echo.

:: -- Kill any process already using port 8000 --
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo [!] Port 8000 is in use with PID %%a. Stopping it...
    taskkill /F /PID %%a >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
    echo [OK] Port 8000 freed.
)

:: -- Kill any process already using port 5173 --
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo [!] Port 5173 is in use with PID %%a. Stopping it...
    taskkill /F /PID %%a >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
    echo [OK] Port 5173 freed.
)

:: -- Start Backend --
echo.
echo [*] Starting Backend (FastAPI on port 8000)...
cd /d "%BACKEND_DIR%"
start /b "Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: Give backend a moment to boot
ping 127.0.0.1 -n 3 >nul

:: -- Start Frontend --
echo.
echo [*] Starting Frontend (Vite on port 5173)...
cd /d "%FRONTEND_DIR%"

echo.
echo ======================================================
echo   [OK] LexiLearn is starting!
echo   [Web] Frontend : http://localhost:5173
echo   [API] Backend  : http://localhost:8000
echo   [Doc] API Docs : http://localhost:8000/docs
echo.
echo   Default Login Credentials:
echo      Admin   - username: admin    password: Admin@123
echo      User    - username: demo     password: Demo1234!
echo.
echo   Press Ctrl+C to stop the frontend.
echo ======================================================
echo.

call npm run dev
