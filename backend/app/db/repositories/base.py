from typing import Generic, TypeVar
from beanie import Document

T = TypeVar("T", bound=Document)


class BaseRepository(Generic[T]):
    """Thin async wrapper around a Beanie document that centralises query patterns."""

    def __init__(self, model: type[T]) -> None:
        self.model = model

    async def get_by_id(self, id: str) -> T | None:
        return await self.model.get(id)

    async def save(self, doc: T) -> T:
        await doc.save()
        return doc

    async def delete(self, doc: T) -> None:
        await doc.delete()
