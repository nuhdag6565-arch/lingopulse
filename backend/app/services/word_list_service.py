from datetime import datetime, timezone

from app.db.repositories.word_list_repository import WordListRepository
from app.domain.models.word import Word
from app.domain.models.word_list import WordList
from app.domain.schemas.word_list import WordListCreate, WordListUpdate


class WordListService:
    def __init__(self) -> None:
        self.list_repo = WordListRepository()

    async def create_list(self, user_id: str, data: WordListCreate) -> WordList:
        wl = WordList(user_id=user_id, name=data.name, description=data.description)
        return await self.list_repo.save(wl)

    async def get_lists(self, user_id: str) -> list[WordList]:
        return await self.list_repo.list_all(user_id)

    async def get_list(self, user_id: str, list_id: str) -> WordList | None:
        return await self.list_repo.find_by_id_and_user(list_id, user_id)

    async def update_list(
        self, user_id: str, list_id: str, data: WordListUpdate
    ) -> WordList | None:
        wl = await self.list_repo.find_by_id_and_user(list_id, user_id)
        if wl is None:
            return None
        if data.name is not None:
            wl.name = data.name
        if data.description is not None:
            wl.description = data.description
        wl.updated_at = datetime.now(timezone.utc)
        return await self.list_repo.save(wl)

    async def delete_list(self, user_id: str, list_id: str) -> bool:
        wl = await self.list_repo.find_by_id_and_user(list_id, user_id)
        if wl is None:
            return False
        await Word.find(Word.list_id == list_id).delete()
        await self.list_repo.delete(wl)
        return True

    async def word_count(self, list_id: str) -> int:
        return await Word.find(Word.list_id == list_id).count()
