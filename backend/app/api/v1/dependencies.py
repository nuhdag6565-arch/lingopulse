from functools import lru_cache
from app.services.word_service import WordService


@lru_cache
def get_word_service() -> WordService:
    return WordService()
