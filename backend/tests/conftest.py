import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from app.main import app
from app.domain.models.word import Word
from app.domain.models.user import User
from app.domain.models.word_list import WordList
from app.domain.models.password_reset import PasswordResetCode


@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    await init_beanie(database=client["test_db"], document_models=[User, Word, WordList, PasswordResetCode])
    yield


@pytest_asyncio.fixture
async def http_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
