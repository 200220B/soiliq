@echo off
echo ==============================================
echo      Starting SoilIQ Full-Stack System...
echo ==============================================
echo.

echo [1/3] Starting Node.js Backend Server...
start cmd /k "node server.js"

echo [2/3] Starting Frontend Web Server...
start cmd /k "npx serve -p 3000"

echo [3/3] Opening your Web Browser...
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo.
echo System is running! You can minimize these black windows (but do not close them).
