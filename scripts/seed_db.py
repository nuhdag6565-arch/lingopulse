"""Seed veritabanına örnek kelimeler ekler.
Kullanım: python scripts/seed_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import get_settings
from app.domain.models.word import Word
from app.domain.models.review import Review

SAMPLE_WORDS = [
    {"word": "serendipity", "meaning": "güzel bir tesadüf"},
    {"word": "ephemeral", "meaning": "geçici, kısa ömürlü"},
    {"word": "resilience", "meaning": "toparlanma gücü, dayanıklılık"},
    {"word": "melancholy", "meaning": "derin hüzün, melankolik his"},
    {"word": "eloquent", "meaning": "akıcı ve etkili konuşan"},
]


async def seed():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)
    await init_beanie(database=client[settings.mongo_db], document_models=[Word, Review])

    for data in SAMPLE_WORDS:
        existing = await Word.find_one(Word.word == data["word"])
        if not existing:
            w = Word(**data)
            await w.save()
            print(f"  + {data['word']}")
        else:
            print(f"  ~ {data['word']} (zaten mevcut)")

    print("Seed tamamlandı.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
