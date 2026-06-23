"""
LingoPulse Kütüphanesi — Kelime Tohumlama Betiği
=================================================
Amaç:
  NLTK, açık kaynaklı JSON veri setleri veya CSV dosyalarından
  binlerce İngilizce-Türkçe kelime çifti okuyarak:
    a) frontend/src/data/lingopulse_library.json dosyasını günceller
    b) (opsiyonel) MongoDB koleksiyonuna toplu olarak yazar

Kullanım:
  python scripts/generate_library.py --target json
  python scripts/generate_library.py --target mongo
  python scripts/generate_library.py --target both --category it --limit 500

Gereksinimler (ileride eklenecek):
  pip install nltk motor aiohttp
"""

import argparse
import asyncio
import json
import logging
from pathlib import Path
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

# ── Sabitler ──────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parents[2]
LIBRARY_JSON = REPO_ROOT / "lingopulse-mobil" / "src" / "data" / "lingopulse_library.json"

CATEGORY_MAP: dict[str, dict[str, Any]] = {
    # CEFR seviyeleri
    "a1": {"title": "A1 · Başlangıç", "emoji": "🌱", "is_premium": False, "group": "cefr_levels"},
    "a2": {"title": "A2 · Temel",      "emoji": "📗", "is_premium": False, "group": "cefr_levels"},
    "b1": {"title": "B1 · Orta Seviye","emoji": "📘", "is_premium": False, "group": "cefr_levels"},
    "b2": {"title": "B2 · Orta-İleri", "emoji": "📙", "is_premium": False, "group": "cefr_levels"},
    "c1": {"title": "C1 · İleri Seviye","emoji": "🎓","is_premium": True,  "group": "cefr_levels"},
    "c2": {"title": "C2 · Ustalık",    "emoji": "🏆", "is_premium": True,  "group": "cefr_levels"},
    # Mesleki kategoriler
    "it":          {"title": "Yazılım ve Bilişim", "emoji": "💻", "is_premium": True,  "group": "professions"},
    "business":    {"title": "İş Dünyası",         "emoji": "🚀", "is_premium": True,  "group": "professions"},
    "medical":     {"title": "Sağlık ve Tıp",      "emoji": "🩺", "is_premium": True,  "group": "professions"},
    "tourism":     {"title": "Turizm ve Seyahat",  "emoji": "✈️", "is_premium": False, "group": "professions"},
    "engineering": {"title": "Mühendislik",        "emoji": "⚙️", "is_premium": True,  "group": "professions"},
    "law":         {"title": "Hukuk ve Adalet",    "emoji": "⚖️", "is_premium": True,  "group": "professions"},
    "finance":     {"title": "Finans ve Ekonomi",  "emoji": "💹", "is_premium": True,  "group": "professions"},
}


# ── Veri kaynakları (iskelet) ──────────────────────────────────────────────────

def load_from_nltk(category_id: str, limit: int) -> list[dict]:
    """
    TODO: NLTK wordnet synsets üzerinden İngilizce kelimeleri çek,
    çeviri için Helsinki-NLP/opus-mt-en-tr modeli kullan.
    """
    raise NotImplementedError("NLTK kaynağı henüz uygulanmadı")


def load_from_csv(filepath: str, limit: int) -> list[dict]:
    """
    TODO: front_word,back_translation sütunlarına sahip CSV dosyasından oku.
    Örnek CSV: https://github.com/open-dict-data/ipa-dict
    """
    raise NotImplementedError("CSV kaynağı henüz uygulanmadı")


def load_from_json_dataset(filepath: str, category_id: str, limit: int) -> list[dict]:
    """
    TODO: Harici bir JSON veri setinden (örn. en-tr çeviri çiftleri) oku.
    Her kelime için {"front_word": "...", "back_translation": "..."} formatı döndür.
    """
    raise NotImplementedError("JSON veri seti kaynağı henüz uygulanmadı")


# ── Çıktı hedefleri ───────────────────────────────────────────────────────────

def update_library_json(category_id: str, new_words: list[dict]) -> None:
    """Mevcut lingopulse_library.json dosyasına kelimeleri ekle/güncelle."""
    with open(LIBRARY_JSON, encoding="utf-8") as f:
        data: dict = json.load(f)

    meta = CATEGORY_MAP.get(category_id)
    if not meta:
        raise ValueError(f"Bilinmeyen kategori: {category_id}")

    group = meta["group"]
    target_list: list = data[group]

    # İlgili kategoriyi bul veya yeni oluştur
    existing = next((c for c in target_list if c["id"] == category_id), None)
    if existing is None:
        existing = {
            "id": category_id,
            "title": meta["title"],
            "emoji": meta["emoji"],
            "is_premium": meta["is_premium"],
            "words": [],
        }
        target_list.append(existing)

    # Tekrar eden kelimeleri atla, yenilerini ekle
    current_words = {w["front_word"] for w in existing["words"]}
    added = 0
    for word in new_words:
        if word["front_word"] not in current_words:
            existing["words"].append(word)
            current_words.add(word["front_word"])
            added += 1

    with open(LIBRARY_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    log.info("JSON güncellendi: %s kategorisine %d yeni kelime eklendi.", category_id, added)


async def insert_to_mongodb(category_id: str, words: list[dict]) -> None:
    """
    TODO: Motor (async MongoDB driver) kullanarak words koleksiyonuna toplu yaz.
    Her belge: { category: str, front_word: str, back_translation: str, cefr: str }
    """
    raise NotImplementedError("MongoDB hedefi henüz uygulanmadı")


# ── Ana akış ──────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="LingoPulse kütüphane kelime üretici")
    p.add_argument("--target", choices=["json", "mongo", "both"], default="json")
    p.add_argument("--category", default="a1", help=f"Kategori ID. Seçenekler: {', '.join(CATEGORY_MAP)}")
    p.add_argument("--source", choices=["nltk", "csv", "json_dataset"], default="nltk")
    p.add_argument("--input", default=None, help="CSV/JSON kaynak dosyası (--source csv/json_dataset için)")
    p.add_argument("--limit", type=int, default=200, help="Eklenecek maksimum kelime sayısı")
    return p.parse_args()


def main() -> None:
    args = parse_args()

    log.info("Kaynak: %s | Kategori: %s | Limit: %d", args.source, args.category, args.limit)

    # 1. Kelimeleri yükle
    if args.source == "nltk":
        words = load_from_nltk(args.category, args.limit)
    elif args.source == "csv":
        words = load_from_csv(args.input or "", args.limit)
    else:
        words = load_from_json_dataset(args.input or "", args.category, args.limit)

    log.info("%d kelime yüklendi.", len(words))

    # 2. Hedefe yaz
    if args.target in ("json", "both"):
        update_library_json(args.category, words)

    if args.target in ("mongo", "both"):
        asyncio.run(insert_to_mongodb(args.category, words))

    log.info("Tamamlandı.")


if __name__ == "__main__":
    main()
