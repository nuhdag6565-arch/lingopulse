# LingoPulse — Ürün Yol Haritası

> **ŞU ANKİ AKTİF AŞAMA: FAZ 1**

> **Strateji:** Her fazı canlıya al, gerçek kullanıcı geri bildirimi al, sonra bir sonraki faza geç. Hiçbir faz production'a çıkmadan bir sonrakine kod yazılmaz.

---

## Faz Durumu

| Faz | Kapsam | Durum |
|-----|--------|-------|
| **Faz 1** | MVP & Temel Omurga | 🔨 **AKTİF GELİŞTİRME** |
| **Faz 2** | Podcast Modu | 📋 Planlandı — Faz 1 canlıya girince başlar |
| **Faz 3** | AI Hikaye Modu | 💡 Vizyon — Faz 2 canlıya girince başlar |

---

## FAZ 1 — MVP & Temel Omurga

**Hedef:** App Store ve Google Play'e çıkabilecek, gerçek kullanıcıların yabancı dil kelimelerini ekleyip tekrar edebildiği minimal ama eksiksiz bir ürün.

### Teknoloji Kararları

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| Backend | Python · FastAPI · Uvicorn | Async-first, otomatik OpenAPI, tip güvenli |
| Veritabanı | MongoDB · Beanie ODM | Şemasız esneklik, hızlı iterasyon, döküman başına SM-2 state |
| Auth | JWT (access 30 dk + refresh 7 gün) | Stateless, mobil dostu, sunucu tarafında session yok |
| Şifre | bcrypt (passlib) | Battle-tested, yavaş hash = brute-force direnci |
| AI | OpenAI gpt-4o-mini / Anthropic claude-haiku | Hız/maliyet dengesi — A2-B1 seviyesi örnek cümle |
| Rate Limit | slowapi (IP tabanlı) | AI endpoint maliyetini kontrol altına alır |
| Mobile | React Native · Expo SDK 51 | Tek kod tabanı iOS + Android, OTA güncelleme |
| State | Redux Toolkit | Öngörülebilir state, DevTools, thunk async akışı |
| Token Depolama | expo-secure-store | iOS Keychain / Android Keystore — asla AsyncStorage değil |
| HTTP | Axios (interceptor + retry queue) | 401 → otomatik token yenileme, concurrent request güvenliği |
| Bildirim | expo-notifications (yerel) | Günlük 20:00 tekrar hatırlatıcısı — sunucu gerektirmez |

### Mimari: Clean Architecture Katmanları

```
mobile_app/              backend/app/
├── screens/             ├── api/v1/endpoints/     ← HTTP Adapter (dış)
├── hooks/               ├── services/             ← Use Case / İş Mantığı
├── store/ (Redux)       ├── repositories/         ← Persistence Adapter
└── api/                 ├── domain/models/        ← Entity / Çekirdek (iç)
                         └── core/                 ← Config, Security, Utils
```

**Kural:** Bağımlılıklar yalnızca içe doğru akar. Domain hiçbir dış katmanı import etmez.

### Faz 1 Özellik Listesi

#### Temel CRUD — Kelime Yönetimi
- [ ] Kullanıcı kelime + anlamını sisteme girer
- [ ] AI, kelime eklenince otomatik A2-B1 örnek cümle üretir
- [ ] Kelime listesi (sayfalı, kullanıcıya özel)
- [ ] Kelime güncelleme / silme
- [ ] Örnek cümle yenile (AI çağrısı)

#### Aralıklı Tekrar (Spaced Repetition — SM-2)
- [ ] Flaşkart arayüzü: ön yüz kelime, arka yüz anlam + cümle
- [ ] **Kırmızı (Bilmiyorum)** → learning_level düşer, kısa sürede tekrar
- [ ] **Yeşil (Biliyorum)** → SM-2 ease_factor & interval_days artar
- [ ] next_review_date hesaplanır, "bugün tekrar edilecekler" filtresi
- [ ] Tekrar geçmişi kaydı

#### Telaffuz
- [ ] Native TTS — cihazın kendi ses motoru (Expo Speech)
- [ ] Kelimeyi seslendir, örnek cümleyi seslendir

#### Auth & Kullanıcı
- [ ] Kayıt (email + şifre)
- [ ] Giriş / Çıkış
- [ ] JWT access + refresh token akışı
- [ ] Güvenli token saklama (Keychain / Keystore)
- [ ] Oturum yenileme (interceptor)

#### UX & Bildirimler
- [ ] Onboarding ekranı (ilk açılış)
- [ ] Günlük tekrar push bildirimi (yerel, 20:00)
- [ ] Toast / hata mesajları
- [ ] Boş durum ekranları
- [ ] Loading göstergesi

#### Canlıya Alım
- [ ] EAS Build (Expo Application Services)
- [ ] App Store Connect kurulumu
- [ ] Google Play Console kurulumu
- [ ] Production environment config (env dosyaları, CORS, MongoDB Atlas)

---

## FAZ 2 — Podcast Modu

> **ŞU AN KODLANMAYACAK.** Faz 1 production'a girip ilk gerçek kullanıcı geri bildirimleri alındıktan sonra başlanır.

**Hedef:** Kullanıcının günlük tekrar listesini, cihazın yerel TTS motoru aracılığıyla ritimli bir çalma listesine dönüştürmek. Kullanıcı telefonu cebine koyar, yürürken dinleyerek öğrenir.

### Çalışma Mantığı

```
Her kelime için sıra:
  1. [İngilizce kelime] → TTS ile seslendir
  2. [1.5 sn sessizlik]
  3. [Türkçe anlamı]   → TTS ile seslendir
  4. [1 sn sessizlik]
  5. [Örnek cümle]     → TTS ile seslendir
  6. [2 sn sessizlik]
  → Sonraki kelime...
```

### Teknik Gereksinimler

| Bileşen | Teknoloji |
|---------|-----------|
| Ses sıralaması | `expo-av` + `expo-speech` ile senkron kuyruk |
| Arka plan oynatma | `expo-av` background mode (iOS: audio session, Android: foreground service) |
| Bildirim kontrol | Media notification (oynat/duraklat/ileri) |
| Offline | Kelimeler zaten yerel Redux store'da — ağ bağlantısı gerekmez |

---

## FAZ 3 — AI Hikaye Modu

> **ŞU AN KODLANMAYACAK.** Faz 2 production'a girip kullanıcı tutunumu doğrulandıktan sonra başlanır.

**Hedef:** Kullanıcının kelime listesindeki kelimeleri içeren kısa, kişiselleştirilmiş AI hikayeleri üretmek. Okuma sırasında bilinmeyen kelime anında tekrar döngüsüne girer.

### Çalışma Mantığı

```
1. Kullanıcının top-N kelimesi backend'e gönderilir.
2. LLM bu kelimeleri içeren A2-B1 seviyesi kısa hikaye üretir.
3. Hikaye frontend'de "split text" olarak render edilir:
   - Her kelime ayrı bir <Text> span'ı
   - Kullanıcının listesindeki kelimeler highlight edilir
4. Kelimeye dokunulunca:
   - Anlam + örnek cümle popup gösterilir
   - "Bilmiyorum" butonuna basılırsa → learning_level=0, SM-2 döngüsüne geri alınır
```

### Teknik Gereksinimler

| Bileşen | Teknoloji |
|---------|-----------|
| Hikaye üretimi | OpenAI GPT-4o / Anthropic claude-3-5-sonnet (streaming) |
| Text parsing | Regex tabanlı token splitter (kelime sınırları) |
| Tıklanabilir kelime | `<Pressable>` wrap her token |
| Önbellekleme | Üretilen hikayeler MongoDB'de saklanır (tekrar üretim maliyeti önlenir) |
| Rate limit | Hikaye endpoint: 5/saat/kullanıcı |

---

## Teknik Borç Takibi

| # | Konu | Öncelik | Hedef Faz |
|---|------|---------|-----------|
| 1 | Refresh token rotation (güvenlik) | Yüksek | 1 |
| 2 | MongoDB Atlas (production hosting) | Yüksek | 1 canlı öncesi |
| 3 | Redis ile AI rate limiting (IP yerine user-based) | Orta | 1b |
| 4 | Sentry error tracking | Orta | 1b |
| 5 | Şifre sıfırlama (email flow) | Orta | 1b |
| 6 | API versioning stratejisi | Düşük | 2 |

---

*Son güncelleme: 2026-05-17*
