from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed
from pydantic import Field


class Word(Document):
    user_id: str
    list_id: str | None = None
    word: Annotated[str, Indexed()]
    meaning: str

    learning_level: int = Field(default=0, ge=0, le=5)
    ease_factor: float = Field(default=2.5, ge=1.3)
    interval_days: int = Field(default=1, ge=1)
    next_review_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "words"
        indexes = [
            "user_id",
            "list_id",
            [("user_id", 1), ("next_review_date", 1)],
            [("user_id", 1), ("word", 1)],
            [("list_id", 1), ("created_at", -1)],
        ]
