from datetime import datetime, timezone

from beanie.operators import LTE

from app.db.repositories.base import BaseRepository
from app.domain.models.word import Word


class WordRepository(BaseRepository[Word]):
    def __init__(self) -> None:
        super().__init__(Word)

    async def list_all(self, page: int = 1, size: int = 20) -> tuple[list[Word], int]:
        skip = (page - 1) * size
        total = await Word.count()
        items = await Word.find_all().skip(skip).limit(size).to_list()
        return items, total

    async def find_due(self, limit: int = 20) -> list[Word]:
        now = datetime.now(timezone.utc)
        return await Word.find(LTE(Word.next_review_date, now)).limit(limit).to_list()

    async def find_by_word(self, word: str) -> Word | None:
        return await Word.find_one(Word.word == word)
