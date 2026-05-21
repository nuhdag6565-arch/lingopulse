@echo off
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0backend"
echo Backend baslatiliyor: http://0.0.0.0:8000
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
