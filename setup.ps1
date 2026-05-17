# LingoPulse — Tek Komutla Geliştirme Ortamı Kurulumu
# Kullanim: .\setup.ps1

Write-Host "`n🚀 LingoPulse geliştirme ortamı kuruluyor...`n" -ForegroundColor Cyan

# ── 1. Backend ────────────────────────────────────────────────────
Write-Host "📦 [1/4] Backend: Python sanal ortamı oluşturuluyor..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

.venv\Scripts\pip install --upgrade pip --quiet
.venv\Scripts\pip install -r requirements.txt --quiet
.venv\Scripts\pip install -r requirements-dev.txt --quiet

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "  ⚠️  backend/.env oluşturuldu — API anahtarlarını eklemeyi unutmayın!" -ForegroundColor Red
}

Write-Host "  ✅ Backend hazır" -ForegroundColor Green
Set-Location ..

# ── 2. Mobile ────────────────────────────────────────────────────
Write-Host "`n📱 [2/4] Mobile: npm paketleri yükleniyor..." -ForegroundColor Yellow
Set-Location mobile_app

npm install --silent

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

Write-Host "  ✅ Mobile hazır" -ForegroundColor Green
Set-Location ..

# ── 3. Docker kontrolü ────────────────────────────────────────────
Write-Host "`n🐳 [3/4] MongoDB (Docker) başlatılıyor..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d mongodb
    Write-Host "  ✅ MongoDB çalışıyor → localhost:27017" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Docker bulunamadı. Docker Desktop'ı başlatıp 'docker-compose up -d mongodb' çalıştırın." -ForegroundColor Red
}

# ── 4. Özet ───────────────────────────────────────────────────────
Write-Host "`n✅ [4/4] Kurulum tamamlandı!`n" -ForegroundColor Green
Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
Write-Host "  1. backend/.env dosyasına OPENAI_API_KEY veya ANTHROPIC_API_KEY ekleyin"
Write-Host "  2. VS Code'da Ctrl+Shift+P → 'Tasks: Run Task' → 'Backend: API Başlat'"
Write-Host "  3. VS Code'da Ctrl+Shift+P → 'Tasks: Run Task' → 'Mobile: Expo Start'"
Write-Host "  4. API docs: http://localhost:8000/docs"
Write-Host ""
