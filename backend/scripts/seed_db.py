#!/usr/bin/env python3
"""
LingoPulse — Veritabanı Tohumlama Betiği (Data Pipeline)
=========================================================
Açık kaynaklı İngilizce kelime frekans listelerini çeker, LibreTranslate ile
Türkçeye çevirir ve MongoDB'ye batch insert yapar.

Kullanım:
  python scripts/seed_db.py --mode cefr
  python scripts/seed_db.py --mode profession --profession it
  python scripts/seed_db.py --mode all
  python scripts/seed_db.py --mode cefr --source local
  python scripts/seed_db.py --mode cefr --limit 2000 --dry-run

Veri Kaynakları (Remote):
  - CEFR frekans listesi: google-10000-english (MIT lisansı)
  - Akademik kelimeler: Open American National Corpus lemma listesi

Veri Kaynakları (Local — scripts/raw_data/):
  - cefr_{level}.csv  →  word,translation  (başlıksız satırlar)
  - profession_{id}.csv  →  word,translation  (başlıksız satırlar)

Çeviri:
  - Birincil: LibreTranslate REST API (--translate-url ile yapılandırılabilir)
  - Yedek:    scripts/raw_data/translations_cache.json  (önceden çevrilen kelimeler)
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import io
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import httpx
import motor.motor_asyncio
from dotenv import load_dotenv

# ── Ortam değişkenleri ────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parents[1] / ".env")

MONGO_URI   = os.getenv("MONGO_URI", "mongodb://localhost:27017/lingopulse")
MONGO_DB    = os.getenv("MONGO_DB", "lingopulse")
COLLECTION  = "library_words"

# ── Sabitler ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
RAW_DATA_DIR = SCRIPT_DIR / "raw_data"
CACHE_FILE   = RAW_DATA_DIR / "translations_cache.json"

BATCH_SIZE = 500

# Frekans sırası → CEFR seviyesi eşlemesi
# (min_rank, max_rank, level, is_premium)
CEFR_BANDS: list[tuple[int, int, str, bool]] = [
    (1,     500,   "A1", False),
    (501,   1500,  "A2", False),
    (1501,  3000,  "B1", False),
    (3001,  5000,  "B2", False),
    (5001,  8000,  "C1", True),
    (8001,  15000, "C2", True),
]

# Mesleki kategoriler
PROFESSION_META: dict[str, dict[str, Any]] = {
    "it":          {"label": "Software",    "is_premium": True},
    "business":    {"label": "Business",    "is_premium": True},
    "medical":     {"label": "Medical",     "is_premium": True},
    "tourism":     {"label": "Tourism",     "is_premium": False},
    "engineering": {"label": "Engineering", "is_premium": True},
    "law":         {"label": "Law",         "is_premium": True},
    "finance":     {"label": "Finance",     "is_premium": True},
}

# Açık kaynaklı İngilizce frekans listesi — MIT lisanslı
# github.com/first20hours/google-10000-english
FREQUENCY_LIST_URL = (
    "https://raw.githubusercontent.com/first20hours/google-10000-english"
    "/master/google-10000-english-no-swears.txt"
)

# LibreTranslate varsayılan kamuya açık örneği
DEFAULT_TRANSLATE_URL = "https://libretranslate.de/translate"

# ── Loglama ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("seed_db")


# ─────────────────────────────────────────────────────────────────────────────
# 1. VERİ ÇEKME (FETCHERS)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_remote_text(url: str, client: httpx.AsyncClient) -> str:
    """Uzak bir URL'den düz metin indirir."""
    log.info("İndiriliyor: %s", url)
    resp = await client.get(url, timeout=30, follow_redirects=True)
    resp.raise_for_status()
    return resp.text


async def fetch_frequency_list_remote(
    client: httpx.AsyncClient,
    limit: int,
) -> list[str]:
    """
    Google 10.000 İngilizce frekans listesini uzaktan çeker.
    Her satır bir kelimedir, frekansa göre sıralıdır.
    """
    text = await fetch_remote_text(FREQUENCY_LIST_URL, client)
    words = [line.strip() for line in text.splitlines() if line.strip()]
    log.info("Frekans listesi indirildi: %d kelime (limit=%d)", len(words), limit)
    return words[:limit]


def fetch_frequency_list_local(level: Optional[str], limit: int) -> list[tuple[str, str]]:
    """
    scripts/raw_data/cefr_{level}.csv dosyasından word,translation çiftleri okur.
    Dosya yoksa boş liste döner.
    """
    pattern = f"cefr_{level}.csv" if level else "cefr_all.csv"
    path = RAW_DATA_DIR / pattern
    if not path.exists():
        log.warning("Yerel CEFR dosyası bulunamadı: %s", path)
        return []
    pairs: list[tuple[str, str]] = []
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.reader(f):
            if len(row) >= 2:
                word, translation = row[0].strip(), row[1].strip()
                if word:
                    pairs.append((word, translation))
    log.info("Yerel dosyadan okundu (%s): %d kelime", path.name, len(pairs))
    return pairs[:limit]


def fetch_profession_local(profession_id: str, limit: int) -> list[tuple[str, str]]:
    """
    scripts/raw_data/profession_{id}.csv dosyasından kelime çiftleri okur.
    CSV formatı: word,translation (her satırda)
    """
    path = RAW_DATA_DIR / f"profession_{profession_id}.csv"
    if not path.exists():
        log.warning("Meslek CSV dosyası bulunamadı: %s", path)
        log.warning(
            "Lütfen '%s' dosyasını oluşturun. "
            "Format: her satırda  word,translation",
            path,
        )
        return []
    pairs: list[tuple[str, str]] = []
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.reader(f):
            if len(row) >= 2:
                word, translation = row[0].strip(), row[1].strip()
                if word:
                    pairs.append((word, translation))
    log.info("Meslek CSV okundu (%s): %d kelime", path.name, len(pairs))
    return pairs[:limit]


# ─────────────────────────────────────────────────────────────────────────────
# 2. ÇEVİRİ (TRANSLATION)
# ─────────────────────────────────────────────────────────────────────────────

def load_translation_cache() -> dict[str, str]:
    """Daha önce çevrilen kelimeleri cache dosyasından yükler."""
    if CACHE_FILE.exists():
        with open(CACHE_FILE, encoding="utf-8") as f:
            cache = json.load(f)
        log.info("Çeviri önbelleği yüklendi: %d giriş", len(cache))
        return cache
    return {}


def save_translation_cache(cache: dict[str, str]) -> None:
    """Güncel cache'i diske yazar."""
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


async def translate_single(
    word: str,
    client: httpx.AsyncClient,
    api_url: str,
    api_key: str = "",
    retries: int = 3,
) -> str:
    """
    LibreTranslate API ile tek kelime çevirir.
    Başarısız olursa orijinal kelimeyi döner.
    """
    payload = {
        "q": word,
        "source": "en",
        "target": "tr",
        "format": "text",
    }
    if api_key:
        payload["api_key"] = api_key

    for attempt in range(1, retries + 1):
        try:
            resp = await client.post(api_url, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                translated: str = data.get("translatedText", word)
                return translated.strip()
            log.debug(
                "Çeviri başarısız (deneme %d/%d): %s → HTTP %d",
                attempt, retries, word, resp.status_code,
            )
        except (httpx.RequestError, httpx.TimeoutException) as exc:
            log.debug("Çeviri bağlantı hatası (deneme %d/%d): %s", attempt, retries, exc)
        if attempt < retries:
            await asyncio.sleep(attempt * 0.5)

    log.warning("Çeviri yapılamadı, orijinal bırakıldı: '%s'", word)
    return word


async def translate_batch(
    words: list[str],
    client: httpx.AsyncClient,
    api_url: str,
    api_key: str = "",
    cache: dict[str, str] | None = None,
    concurrency: int = 5,
) -> dict[str, str]:
    """
    Kelime listesini LibreTranslate ile paralel olarak çevirir.
    Cache'den bulunanları tekrar çevirmez.
    """
    if cache is None:
        cache = {}

    # Sadece cache'de olmayanları çevir
    missing = [w for w in words if w not in cache]
    if not missing:
        return {w: cache[w] for w in words}

    log.info("Çevrilecek kelime sayısı: %d (cache'den: %d)", len(missing), len(words) - len(missing))

    results: dict[str, str] = dict(cache)
    semaphore = asyncio.Semaphore(concurrency)

    async def translate_one(word: str) -> None:
        async with semaphore:
            translation = await translate_single(word, client, api_url, api_key)
            results[word] = translation
            cache[word] = translation

    await asyncio.gather(*[translate_one(w) for w in missing])
    return {w: results.get(w, w) for w in words}


# ─────────────────────────────────────────────────────────────────────────────
# 3. DÖNÜŞTÜRME (TRANSFORM)
# ─────────────────────────────────────────────────────────────────────────────

def assign_cefr_level(rank: int) -> tuple[str, bool]:
    """Frekans sırasını CEFR seviyesi ve premium durumuna çevirir."""
    for min_r, max_r, level, is_premium in CEFR_BANDS:
        if min_r <= rank <= max_r:
            return level, is_premium
    return "C2", True  # 15000+ → C2


def make_word_doc(
    front_word: str,
    back_translation: str,
    category: str,       # "CEFR" veya "Profession"
    level: str,          # "A1"..."C2" veya "Software", "Business" vb.
    is_premium: bool,
    source: str = "seed_script",
) -> dict[str, Any]:
    """Standart MongoDB belge formatı."""
    return {
        "front_word":       front_word.lower().strip(),
        "back_translation": back_translation.strip(),
        "category":         category,
        "level":            level,
        "is_premium":       is_premium,
        "source":           source,
        "created_at":       datetime.now(timezone.utc),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. BATCH INSERT (ilerleme göstergesiyle)
# ─────────────────────────────────────────────────────────────────────────────

async def batch_insert(
    collection: motor.motor_asyncio.AsyncIOMotorCollection,
    docs: list[dict],
    batch_size: int = BATCH_SIZE,
    dry_run: bool = False,
) -> int:
    """
    Belge listesini batch'ler halinde insert_many ile yazar.
    Zaten var olan kelimeler (front_word + level çakışması) güncellenir.
    Dönüş değeri: eklenen / güncellenen toplam belge sayısı.
    """
    if not docs:
        log.warning("Eklenecek belge yok.")
        return 0

    total     = len(docs)
    inserted  = 0
    start     = time.perf_counter()

    for batch_start in range(0, total, batch_size):
        batch = docs[batch_start: batch_start + batch_size]
        batch_end = min(batch_start + batch_size, total)

        if dry_run:
            log.info(
                "  [DRY-RUN] %d – %d / %d  →  örnek: %s → %s",
                batch_start + 1, batch_end, total,
                batch[0]["front_word"], batch[0]["back_translation"],
            )
            inserted += len(batch)
            continue

        # Upsert: aynı kelime + seviye varsa güncelle, yoksa ekle
        from pymongo import UpdateOne as _UpdateOne

        operations = [
            _UpdateOne(
                {"front_word": doc["front_word"], "level": doc["level"]},
                {"$set": doc},
                upsert=True,
            )
            for doc in batch
        ]
        result = await collection.bulk_write(operations, ordered=False)
        batch_inserted = result.upserted_count + result.modified_count
        inserted += batch_inserted

        elapsed = time.perf_counter() - start
        speed   = (batch_end) / elapsed if elapsed > 0 else 0
        remaining = (total - batch_end) / speed if speed > 0 else 0

        print(
            f"\r  İlerleme: {batch_end}/{total}  "
            f"[{'█' * int(batch_end / total * 30):<30}]  "
            f"{batch_end / total * 100:.1f}%  "
            f"~{remaining:.0f}s kaldı",
            end="",
            flush=True,
        )

    if not dry_run:
        print()  # satır sonu

    elapsed_total = time.perf_counter() - start
    log.info("  Tamamlandı: %d / %d işlendi (%.1fs)", inserted, total, elapsed_total)
    return inserted


# ─────────────────────────────────────────────────────────────────────────────
# 5. CEFR PİPELINE
# ─────────────────────────────────────────────────────────────────────────────

async def run_cefr_pipeline(
    *,
    source: str,
    limit: int,
    translate_url: str,
    translate_key: str,
    db: motor.motor_asyncio.AsyncIOMotorDatabase,
    dry_run: bool,
    client: httpx.AsyncClient,
) -> None:
    collection = db[COLLECTION]
    cache      = load_translation_cache()

    if source == "remote":
        log.info("── CEFR Pipeline — Uzak kaynak ──")
        words = await fetch_frequency_list_remote(client, limit)
        word_pairs = [(w, "") for w in words]  # çeviri henüz yok
    else:
        log.info("── CEFR Pipeline — Yerel kaynak ──")
        all_pairs: list[tuple[str, str]] = []
        for _, _, level, _ in CEFR_BANDS:
            pairs = fetch_frequency_list_local(level.lower(), limit)
            all_pairs.extend(pairs)
        word_pairs = all_pairs

    # Çeviri gereken kelimeleri belirle (çeviri boş olanlar)
    needs_translation = [w for w, t in word_pairs if not t]
    if needs_translation:
        log.info("LibreTranslate'e gönderilecek: %d kelime", len(needs_translation))
        translations = await translate_batch(
            needs_translation, client, translate_url, translate_key, cache,
        )
        save_translation_cache(cache)
        # Çeviri sonuçlarını birleştir
        word_pairs = [
            (w, t if t else translations.get(w, w))
            for w, t in word_pairs
        ]
    else:
        log.info("Tüm çeviriler yerel dosyada mevcut.")

    # CEFR seviyelerine göre dağıt
    all_docs: list[dict] = []
    for rank, (word, translation) in enumerate(word_pairs, start=1):
        level, is_premium = assign_cefr_level(rank)
        doc = make_word_doc(
            front_word=word,
            back_translation=translation,
            category="CEFR",
            level=level,
            is_premium=is_premium,
            source="google-10000" if source == "remote" else "local_csv",
        )
        all_docs.append(doc)

    # Seviye bazında ilerleme gösterimi
    for _, _, level, _ in CEFR_BANDS:
        level_docs = [d for d in all_docs if d["level"] == level]
        if not level_docs:
            continue
        log.info("→ %s kelimeleri ekleniyor... (%d adet)", level, len(level_docs))
        await batch_insert(collection, level_docs, BATCH_SIZE, dry_run)

    log.info("CEFR pipeline tamamlandı. Toplam: %d belge.", len(all_docs))


# ─────────────────────────────────────────────────────────────────────────────
# 6. MESLEKİ PİPELINE
# ─────────────────────────────────────────────────────────────────────────────

async def run_profession_pipeline(
    *,
    profession_id: str,
    limit: int,
    translate_url: str,
    translate_key: str,
    db: motor.motor_asyncio.AsyncIOMotorDatabase,
    dry_run: bool,
    client: httpx.AsyncClient,
) -> None:
    collection = db[COLLECTION]
    cache      = load_translation_cache()

    professions = (
        list(PROFESSION_META.keys()) if profession_id == "all" else [profession_id]
    )

    for pid in professions:
        meta = PROFESSION_META.get(pid)
        if not meta:
            log.error("Bilinmeyen meslek ID: %s", pid)
            continue

        log.info("── Meslek Pipeline: %s (%s) ──", pid, meta["label"])
        pairs = fetch_profession_local(pid, limit)
        if not pairs:
            log.warning("%s için veri bulunamadı, atlanıyor.", pid)
            continue

        # Çeviri boş olanları çevir
        needs_translation = [w for w, t in pairs if not t]
        if needs_translation:
            log.info("LibreTranslate: %d kelime çevriliyor...", len(needs_translation))
            translations = await translate_batch(
                needs_translation, client, translate_url, translate_key, cache,
            )
            save_translation_cache(cache)
            pairs = [(w, t if t else translations.get(w, w)) for w, t in pairs]

        docs = [
            make_word_doc(
                front_word=word,
                back_translation=translation,
                category="Profession",
                level=meta["label"],
                is_premium=meta["is_premium"],
                source=f"local_csv_{pid}",
            )
            for word, translation in pairs
        ]

        log.info("→ %s kelimeleri ekleniyor... (%d adet)", meta["label"], len(docs))
        await batch_insert(collection, docs, BATCH_SIZE, dry_run)

    log.info("Mesleki pipeline tamamlandı.")


# ─────────────────────────────────────────────────────────────────────────────
# 7. VERİTABANI YARDIMCILARI
# ─────────────────────────────────────────────────────────────────────────────

async def ensure_indexes(db: motor.motor_asyncio.AsyncIOMotorDatabase) -> None:
    """Hızlı arama için gerekli indeksleri oluşturur."""
    col = db[COLLECTION]
    await col.create_index([("front_word", 1), ("level", 1)], unique=True)
    await col.create_index([("category", 1)])
    await col.create_index([("level", 1)])
    await col.create_index([("front_word", "text"), ("back_translation", "text")])
    log.info("MongoDB indeksleri hazır.")


async def print_stats(db: motor.motor_asyncio.AsyncIOMotorDatabase) -> None:
    """Koleksiyondaki mevcut belge istatistiklerini gösterir."""
    col = db[COLLECTION]
    pipeline = [
        {"$group": {"_id": {"category": "$category", "level": "$level"}, "count": {"$sum": 1}}},
        {"$sort": {"_id.category": 1, "_id.level": 1}},
    ]
    cursor = col.aggregate(pipeline)
    rows = await cursor.to_list(length=None)

    print("\n┌─────────────────────────────────────────┐")
    print("│       LingoPulse — Kütüphane Özeti       │")
    print("├──────────────┬─────────────┬─────────────┤")
    print("│ Kategori     │ Seviye      │    Kelime   │")
    print("├──────────────┼─────────────┼─────────────┤")
    total = 0
    for row in rows:
        cat   = row["_id"]["category"]
        level = row["_id"]["level"]
        count = row["count"]
        total += count
        print(f"│ {cat:<12} │ {level:<11} │ {count:>11} │")
    print("├──────────────┴─────────────┼─────────────┤")
    print(f"│ TOPLAM                     │ {total:>11} │")
    print("└────────────────────────────┴─────────────┘\n")


# ─────────────────────────────────────────────────────────────────────────────
# 8. CLI & ANA AKIŞ
# ─────────────────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="LingoPulse veritabanı tohumlama aracı",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--mode",
        choices=["cefr", "profession", "all", "stats"],
        default="stats",
        help="Çalıştırılacak pipeline. 'stats' sadece mevcut durumu gösterir.",
    )
    p.add_argument(
        "--source",
        choices=["remote", "local"],
        default="local",
        help="Veri kaynağı: 'remote' (GitHub URL) veya 'local' (raw_data/ CSV).",
    )
    p.add_argument(
        "--profession",
        default="all",
        help=f"Meslek ID veya 'all'. Seçenekler: {', '.join(PROFESSION_META)}",
    )
    p.add_argument(
        "--limit",
        type=int,
        default=5000,
        help="Kategori başına maksimum kelime sayısı (varsayılan: 5000).",
    )
    p.add_argument(
        "--translate-url",
        default=DEFAULT_TRANSLATE_URL,
        help="LibreTranslate API adresi.",
    )
    p.add_argument(
        "--translate-key",
        default="",
        help="LibreTranslate API anahtarı (gerekiyorsa).",
    )
    p.add_argument(
        "--mongo-uri",
        default=MONGO_URI,
        help="MongoDB bağlantı dizesi.",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Veritabanına yazmaz; sadece işlenecek veriyi gösterir.",
    )
    p.add_argument(
        "--batch-size",
        type=int,
        default=BATCH_SIZE,
        help=f"Batch boyutu (varsayılan: {BATCH_SIZE}).",
    )
    return p


async def main(args: argparse.Namespace) -> None:
    # MongoDB bağlantısı
    log.info("MongoDB'ye bağlanılıyor: %s", args.mongo_uri)
    motor_client = motor.motor_asyncio.AsyncIOMotorClient(args.mongo_uri)
    db = motor_client[MONGO_DB]

    try:
        await db.command("ping")
        log.info("MongoDB bağlantısı başarılı.")
    except Exception as exc:
        log.error("MongoDB bağlantı hatası: %s", exc)
        sys.exit(1)

    # İndeksler
    if not args.dry_run:
        await ensure_indexes(db)

    # HTTP istemcisi
    async with httpx.AsyncClient() as client:
        if args.mode == "stats":
            await print_stats(db)

        elif args.mode in ("cefr", "all"):
            await run_cefr_pipeline(
                source=args.source,
                limit=args.limit,
                translate_url=args.translate_url,
                translate_key=args.translate_key,
                db=db,
                dry_run=args.dry_run,
                client=client,
            )
            if args.mode == "cefr":
                await print_stats(db)

        if args.mode in ("profession", "all"):
            await run_profession_pipeline(
                profession_id=args.profession,
                limit=args.limit,
                translate_url=args.translate_url,
                translate_key=args.translate_key,
                db=db,
                dry_run=args.dry_run,
                client=client,
            )
            await print_stats(db)

    motor_client.close()
    log.info("Betik tamamlandı.")


if __name__ == "__main__":
    parser  = build_parser()
    args    = parser.parse_args()
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    asyncio.run(main(args))
