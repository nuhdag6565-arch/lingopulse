from app.db.repositories.base import BaseRepository
from app.domain.models.review import Review


class ReviewRepository(BaseRepository[Review]):
    def __init__(self) -> None:
        super().__init__(Review)

    async def list_for_word(self, word_id: str, limit: int = 50) -> list[Review]:
        return (
            await Review.find(Review.word.id == word_id)  # type: ignore[attr-defined]
            .sort(-Review.reviewed_at)
            .limit(limit)
            .to_list()
        )
