from datetime import datetime, timezone

from beanie import Document
from pydantic import Field


class WordList(Document):
    user_id: str
    name: str
    description: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "word_lists"
        indexes = ["user_id"]
