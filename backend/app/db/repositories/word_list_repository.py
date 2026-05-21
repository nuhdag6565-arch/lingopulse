from app.db.repositories.base import BaseRepository
from app.domain.models.word_list import WordList


class WordListRepository(BaseRepository[WordList]):
    def __init__(self) -> None:
        super().__init__(WordList)

    async def list_all(self, user_id: str) -> list[WordList]:
        return (
            await WordList.find(WordList.user_id == user_id)
            .sort(-WordList.created_at)
            .to_list()
        )

    async def find_by_id_and_user(self, list_id: str, user_id: str) -> WordList | None:
        wl = await self.get_by_id(list_id)
        if wl is not None and wl.user_id == user_id:
            return wl
        return None
