@echo off
chcp 65001 >nul
set PYTHONUTF8=1

echo ==========================================
echo   LingoPulse Gelistirme Ortami
echo ==========================================

:: Mevcut DHCP IP adresini PowerShell ile bul (daha guvenilir)
for /f "usebackq" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' -and $_.PrefixOrigin -eq 'Dhcp' } | Select-Object -First 1).IPAddress"`) do set CURRENT_IP=%%i

echo [1/3] Mevcut IP: %CURRENT_IP%

:: .env.local dosyasını guncelle
set ENV_FILE=%~dp0lingopulse-mobil\.env.local
echo # Fiziksel Android/iOS cihaz icin -- bilgisayarinla ayni Wi-Fi'da olmalisin > "%ENV_FILE%"
echo EXPO_PUBLIC_API_URL=http://%CURRENT_IP%:8000/api/v1 >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # Android Emulator kullaniyorsan bu satiri kullan: >> "%ENV_FILE%"
echo # EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1 >> "%ENV_FILE%"

echo [2/3] .env.local guncellendi ^(IP: %CURRENT_IP%^)

:: Backend'i ayri pencerede baslat
echo [3/3] Backend baslatiliyor...
start "LingoPulse Backend" cmd /k "chcp 65001 >nul && cd /d "%~dp0backend" && set PYTHONUTF8=1 && echo Backend: http://%CURRENT_IP%:8000 && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo  Backend : http://%CURRENT_IP%:8000
echo  Sonraki : npx expo start --clear
echo ==========================================
echo.
pause
