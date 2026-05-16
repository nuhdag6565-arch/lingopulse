# LinguaAI — Yapay Zeka Destekli Dil Öğrenme Uygulaması

> Mobil Öncelikli (Mobile-First) MVP | FastAPI + MongoDB + React Native (Expo)

---

## Mimari Genel Bakış

Bu proje, **Temiz Mimari (Clean Architecture)** prensiplerine göre yapılandırılmış bir monorepo'dur.

```
.
├── backend/          # FastAPI REST API (Python)
├── mobile_app/       # React Native Expo (iOS & Android)
├── docs/             # Mimari ve API dokümantasyonu
├── scripts/          # Kurulum ve seed betikleri
└── docker-compose.yml
```

---

## Hızlı Başlangıç

### Ön Gereksinimler
- Docker & Docker Compose
- Python 3.11+
- Node.js 20+ & npm / yarn
- Expo CLI (`npm install -g expo-cli`)

### 1. Repoyu Klonla
```bash
git clone https://github.com/<org>/lingua-ai.git
cd lingua-ai
```

### 2. Backend Ortamını Kur
```bash
cd backend
cp .env.example .env          # API anahtarlarını doldur
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Veritabanını Başlat (Docker)
```bash
# Proje kökünden
docker-compose up -d mongodb
```

### 4. API'yi Çalıştır
```bash
cd backend
uvicorn app.main:app --reload
# http://localhost:8000/docs
```

### 5. Mobil Uygulamayı Çalıştır
```bash
cd mobile_app
npm install
npx expo start
```

---

## Temel Özellikler (MVP)

| Özellik | Durum |
|---|---|
| Kelime CRUD | ✅ |
| AI Örnek Cümle Üretimi (OpenAI / Anthropic) | ✅ |
| Aralıklı Tekrar (SM-2 Algoritması) | ✅ |
| Flaşkart Arayüzü (Kırmızı/Yeşil) | ✅ |
| Native TTS (Cihaz Sesi) | ✅ |

---

## Dokümantasyon
- [Mimari Kararlar](docs/architecture.md)
- [API Referansı](docs/api.md)
- [Aralıklı Tekrar Algoritması](docs/spaced-repetition.md)
