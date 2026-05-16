# API Referansı

Base URL: `http://localhost:8000/api/v1`

Interaktif dokümantasyon: `http://localhost:8000/docs`

---

## Kelimeler `/words`

| Method | Path | Açıklama |
|---|---|---|
| GET | `/words/` | Tüm kelimeleri listele (sayfalı) |
| POST | `/words/` | Yeni kelime ekle (AI ile zenginleştir) |
| GET | `/words/due` | Tekrar bekleyen kelimeleri getir |
| GET | `/words/{id}` | Tek kelime getir |
| PATCH | `/words/{id}` | Kelimeyi güncelle |
| DELETE | `/words/{id}` | Kelimeyi sil |
| POST | `/words/{id}/regenerate-example` | AI örnek cümlesini yenile |

### POST /words/ — İstek Gövdesi
```json
{
  "word": "serendipity",
  "meaning": "güzel bir tesadüf"
}
```

### Kelime Yanıt Şeması
```json
{
  "id": "...",
  "word": "serendipity",
  "meaning": "güzel bir tesadüf",
  "example_sentence": "She found her dream job by serendipity.",
  "example_sentence_translation": "Rüya işini tesadüfen buldu.",
  "learning_level": 0,
  "ease_factor": 2.5,
  "interval_days": 1,
  "next_review_date": "2026-05-17T00:00:00Z",
  "created_at": "2026-05-16T10:00:00Z",
  "updated_at": "2026-05-16T10:00:00Z"
}
```

---

## Tekrar `/reviews`

| Method | Path | Açıklama |
|---|---|---|
| POST | `/reviews/` | Flaşkart tekrarı kaydet |

### POST /reviews/ — İstek Gövdesi
```json
{
  "word_id": "...",
  "knew_it": true
}
```

---

## Sağlık `/health`

| Method | Path | Açıklama |
|---|---|---|
| GET | `/health/` | Servis sağlık kontrolü |
