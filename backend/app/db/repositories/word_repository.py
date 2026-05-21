from datetime import datetime, timezone

from beanie.operators import LTE

from app.db.repositories.base import BaseRepository
from app.domain.models.word import Word


class WordRepository(BaseRepository[Word]):
    def __init__(self) -> None:
        super().__init__(Word)

    async def list_all(
        self,
        user_id: str,
        page: int = 1,
        size: int = 50,
        list_id: str | None = None,
    ) -> tuple[list[Word], int]:
        skip = (page - 1) * size
        query = Word.find(Word.user_id == user_id)
        if list_id is not None:
            query = query.find(Word.list_id == list_id)
        total = await query.count()
        items = await query.sort(-Word.created_at).skip(skip).limit(size).to_list()
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
