import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.domain.models.user import User
from app.domain.models.word import Word
from app.domain.models.word_list import WordList
from app.domain.models.review import Review
from app.domain.models.password_reset import PasswordResetCode

settings = get_settings()
logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.mongo_uri)
    await init_beanie(
        database=_client[settings.mongo_db],
        document_models=[User, WordList, Word, Review, PasswordResetCode],
    )
    logger.info("MongoDB connected: %s", settings.mongo_db)


async def close_db() -> None:
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _client
