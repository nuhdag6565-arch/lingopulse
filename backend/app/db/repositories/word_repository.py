from datetime import datetime, timezone

from beanie.operators import LTE

from app.db.repositories.base import BaseRepository
from app.domain.models.word import Word


class WordRepository(BaseRepository[Word]):
    def __init__(self) -> None:
        super().__init__(Word)

    async def list_all(
        self, user_id: str, page: int = 1, size: int = 20
    ) -> tuple[list[Word], int]:
        skip = (page - 1) * size
        total = await Word.find(Word.user_id == user_id).count()
        items = (
            await Word.find(Word.user_id == user_id)
            .sort(-Word.created_at)
            .skip(skip)
            .limit(size)
            .to_list()
        )
        return items, total

    async def find_due(self, user_id: str, limit: int = 20) -> list[Word]:
        now = datetime.now(timezone.utc)
        return (
            await Word.find(Word.user_id == user_id, LTE(Word.next_review_date, now))
            .limit(limit)
            .to_list()
        )

    async def find_by_word(self, user_id: str, word: str) -> Word | None:
        return await Word.find_one(Word.user_id == user_id, Word.word == word)
