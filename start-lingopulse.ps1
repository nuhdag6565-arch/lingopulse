# LingoPulse -- Otomatik Baslangic Scripti
# Her Windows girisinde calisir: IP gunceller + backend baslatir.

$projectRoot = $PSScriptRoot
$envFile     = "$projectRoot\lingopulse-mobil\.env.local"
$backendPath = "$projectRoot\backend"
$pythonExe   = "$backendPath\.venv\Scripts\python.exe"

# ── 1. Ag hazir olana kadar bekle (max 90 saniye) ─────────────────────────────
$ip      = $null
$elapsed = 0

while (-not $ip -and $elapsed -lt 90) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike '127.*' -and
            $_.IPAddress -notlike '169.*' -and
            $_.PrefixOrigin -eq 'Dhcp'
        } | Select-Object -First 1).IPAddress

    if (-not $ip) {
        Start-Sleep -Seconds 5
        $elapsed += 5
    }
}

if (-not $ip) {
    # Ag bulunamadi, lokal fallback
    $ip = "localhost"
}

# ── 2. .env.local guncelle ────────────────────────────────────────────────────
$envContent = @"
# Fiziksel Android/iOS cihaz icin -- bilgisayarinla ayni Wi-Fi'da olmalisin
EXPO_PUBLIC_API_URL=http://${ip}:8000/api/v1

# Android Emulator kullaniyorsan bu satiri kullan:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
"@

Set-Content -Path $envFile -Value $envContent -Encoding UTF8

# ── 3. Backend'i yeni cmd penceresinde baslat ─────────────────────────────────
$cmd = "chcp 65001 >nul && cd /d `"$backendPath`" && set PYTHONUTF8=1 && echo. && echo  LingoPulse Backend -- http://${ip}:8000 && echo. && `"$pythonExe`" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Process cmd -ArgumentList "/k", $cmd
