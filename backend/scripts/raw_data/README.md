# LingoPulse — Ham Veri Klasörü

Bu klasör `seed_db.py` betiğinin okuduğu CSV dosyalarını barındırır.

## Dosya Adlandırma Kuralı

### CEFR Seviyeleri
```
cefr_a1.csv
cefr_a2.csv
cefr_b1.csv
cefr_b2.csv
cefr_c1.csv
cefr_c2.csv
```

### Mesleki Kategoriler
```
profession_it.csv
profession_business.csv
profession_medical.csv
profession_tourism.csv
profession_engineering.csv
profession_law.csv
profession_finance.csv
```

## CSV Formatı

Başlık satırı YOK. Her satır: `ingilizce_kelime,türkçe_çeviri`

```csv
algorithm,algoritma
backend,arka uç
cache,önbellek
```

Çeviri sütunu boş bırakılırsa betik otomatik olarak LibreTranslate'e gönderir:
```csv
algorithm,
backend,
cache,
```

## Açık Kaynak Veri Setleri

### İngilizce Frekans Listesi (MIT Lisansı)
```
https://github.com/first20hours/google-10000-english
```
İndirme: `google-10000-english-no-swears.txt` → Her satır bir kelime, frekansa göre sıralı.

### CEFR Kelime Listeleri (Creative Commons)
```
https://github.com/languagetool-org/languagetool (İngilizce kural dosyaları)
https://www.efllevels.com  (manuel export gerekir)
```

### Teknik Terimler (Açık Kaynak Sözlükler)
```
https://github.com/dariusk/corpora  (Creative Commons — kategorilere göre kelimeler)
https://github.com/jnooree/wikt2dict (Wiktionary çeviri çiftleri)
```

## LibreTranslate Kurulumu (Yerel)

Ücretsiz, kendi sunucunuzda:
```bash
pip install libretranslate
libretranslate --load-only en,tr
```
Ardından betiği şu şekilde çalıştırın:
```bash
python scripts/seed_db.py --mode all --translate-url http://localhost:5000/translate
```

## Örnek Kullanım

```bash
# Mevcut durumu görüntüle
python scripts/seed_db.py --mode stats

# Tüm CEFR kelimelerini yerel CSV'den ekle (çeviri otomatik)
python scripts/seed_db.py --mode cefr --source local

# GitHub'dan frekans listesi çek, çevir ve ekle
python scripts/seed_db.py --mode cefr --source remote --limit 3000

# Tek mesleki kategori ekle
python scripts/seed_db.py --mode profession --profession it

# Tüm kategorileri ekle, yazmadan test et
python scripts/seed_db.py --mode all --dry-run
```
