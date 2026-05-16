# Aralıklı Tekrar Algoritması (SM-2)

Uygulama, SuperMemo SM-2 algoritmasının basitleştirilmiş bir uygulamasını kullanır.

## Temel Kavramlar

| Alan | Açıklama |
|---|---|
| `learning_level` | 0–5 arası öğrenme seviyesi. 0 = yeni/bilinmiyor, 5 = tam öğrenilmiş |
| `ease_factor` | Sonraki aralığı büyütme çarpanı. Başlangıç: 2.5, minimum: 1.3 |
| `interval_days` | Bir sonraki tekrara kadar gün sayısı |
| `next_review_date` | Bir sonraki tekrar zamanı (UTC) |

## Algoritma Akışı

```
Kullanıcı "Biliyorum" → quality = 5
Kullanıcı "Bilmiyorum" → quality = 2

Yeni EF = max(1.3, EF + 0.1 − (5 − quality) × (0.08 + (5 − quality) × 0.02))

Eğer quality < 3:
    level = 0, interval = 1 gün

Eğer quality >= 3:
    level += 1 (maks 5)
    Eğer level == 1: interval = 1 gün
    Eğer level == 2: interval = 6 gün
    Değilse: interval = round(interval × EF)

next_review_date = şimdi + interval gün
```

## Flaşkart Akışı

```
[Kart Göster: sadece kelime]
        ↓
[Kullanıcı "Anlamı Göster"e tıklar]
        ↓
[Anlam + Örnek Cümle gösterilir]
        ↓
[Kırmızı: Bilmiyorum]  [Yeşil: Biliyorum]
        ↓
[POST /reviews/ → interval ve level güncellenir]
        ↓
[Sıradaki kelimeye geç]
```
