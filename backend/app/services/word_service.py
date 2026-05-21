from datetime import datetime, timezone

from app.db.repositories.word_repository import WordRepository
from app.db.repositories.review_repository import ReviewRepository
from app.domain.models.word import Word
from app.domain.models.review import Review
from app.domain.schemas.word import WordCreate, WordUpdate
from app.services.spaced_repetition_service import calculate_next_review


class WordService:
    def __init__(self) -> None:
        self.word_repo = WordRepository()
        self.review_repo = ReviewRepository()

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

    async def submit_review(self, user_id: str, word_id: str, knew_it: bool) -> Review | None:
        word = await self.word_repo.get_by_id(word_id)
        if word is None or word.user_id != user_id:
            return None

        result = calculate_next_review(
            knew_it=knew_it,
            current_level=word.learning_level,
            current_ease_factor=word.ease_factor,
            current_interval_days=word.interval_days,
        )

        review = Review(
            word=word,
            knew_it=knew_it,
            previous_level=word.learning_level,
            new_level=result.new_level,
            previous_interval_days=word.interval_days,
            new_interval_days=result.new_interval_days,
        )
        await self.review_repo.save(review)

        word.learning_level = result.new_level
        word.ease_factor = result.new_ease_factor
        word.interval_days = result.new_interval_days
        word.next_review_date = result.next_review_date
        word.updated_at = datetime.now(timezone.utc)
        await self.word_repo.save(word)
        return review
