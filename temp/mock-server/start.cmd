@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting V1 mock server...
node server.js
pause
