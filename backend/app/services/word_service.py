from datetime import datetime, timezone

from app.db.repositories.word_repository import WordRepository
from app.domain.models.word import Word
from app.domain.schemas.word import WordCreate, WordUpdate


class WordService:
    def __init__(self) -> None:
        self.word_repo = WordRepository()

    async def create_word(self, user_id: str, data: WordCreate) -> Word:
        word = Word(
            user_id=user_id,
            list_id=data.list_id,
            word=data.word,
            meaning=data.meaning,
        )
        return await self.word_repo.save(word)

    async def update_word(self, user_id: str, word_id: str, data: WordUpdate) -> Word | None:
        word = await self.word_repo.get_by_id(word_id)
        if word is None or word.user_id != user_id:
            return None
        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(word, field, value)
        word.updated_at = datetime.now(timezone.utc)
        return await self.word_repo.save(word)

    async def delete_word(self, user_id: str, word_id: str) -> bool:
        word = await self.word_repo.get_by_id(word_id)
        if word is None or word.user_id != user_id:
            return False
        await self.word_repo.delete(word)
        return True

