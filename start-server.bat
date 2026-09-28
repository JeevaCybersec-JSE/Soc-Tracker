@echo off
title SOC Alert Tracker - Port 3000
echo ====================================================
echo Starting SOC Alert Tracker on http://localhost:3000
echo ====================================================
if exist "%~dp0node.exe" (
  "%~dp0node.exe" "%~dp0server.js"
) else (
  where python >nul 2>nul
  if %errorlevel% equ 0 (
    python -m http.server 3000
  ) else (
    node "%~dp0server.js"
  )
)
pause
