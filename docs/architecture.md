# Mimari Kararlar

## Genel Yapı

Bu proje **Temiz Mimari (Clean Architecture)** ilkelerine göre katmanlanmıştır:

```
Dış Dünya (HTTP / Mobil)
    └── API Layer (FastAPI Routers + Schemas)
         └── Service Layer (İş Mantığı)
              └── Repository Layer (Veri Erişimi)
                   └── Domain Models (Beanie Documents)
                        └── MongoDB
```

Bağımlılık kuralı: her katman yalnızca bir içteki katmana bağımlıdır. API katmanı MongoDB'yi doğrudan bilmez.

## Backend Klasör Kararları

| Klasör | Sorumluluk |
|---|---|
| `app/core/` | Uygulama geneli ayarlar ve loglama |
| `app/domain/models/` | MongoDB'deki belge şemaları (Beanie) |
| `app/domain/schemas/` | HTTP request/response Pydantic modelleri |
| `app/db/repositories/` | Veritabanı sorgu mantığı (tek yer) |
| `app/services/` | İş kuralları — AI çağrısı, SR algoritması, orkestrasyon |
| `app/api/v1/endpoints/` | HTTP handler'ları; iş mantığı içermez |

## Mobile Klasör Kararları

| Klasör | Sorumluluk |
|---|---|
| `src/api/` | HTTP çağrıları — sadece fetch, state yok |
| `src/store/` | Redux Toolkit slice'ları — state ve async thunk'lar |
| `src/hooks/` | Ekranları store'dan izole eden React hook'ları |
| `src/components/` | Saf UI bileşenleri — iş mantığı içermez |
| `src/screens/` | Navigasyon ve hook'ları bağlayan kaplama |

## AI Entegrasyonu Kararı

AI servis katmanı `openai` ve `anthropic` sağlayıcılarını soyutlar. Sağlayıcı `AI_PROVIDER` env değişkeni ile değiştirilebilir, uygulama kodu değişmez.

## TTS Kararı

Native TTS backend'e hiç bağlanmaz. `expo-speech` doğrudan cihazda konuşur. Backend yalnızca `word`, `meaning`, `example_sentence`, `example_sentence_translation` alanlarını ayrı olarak döner — mobil taraf istediği alanı seslendirilebilir.
