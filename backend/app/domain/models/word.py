from datetime import datetime, timezone
from typing import Annotated, Optional

from beanie import Document, Indexed
from bson import ObjectId
from pydantic import Field


class Word(Document):
    """MongoDB document for a vocabulary entry — her kelime bir kullanıcıya aittir."""

    user_id: str  # User.id string olarak saklanır (ObjectId str)
    word: Annotated[str, Indexed()]
    meaning: str
    example_sentence: str = ""
    example_sentence_translation: str = ""

    # Spaced repetition (SM-2)
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
            [("user_id", 1), ("next_review_date", 1)],  # tekrar sorgusu için bileşik index
            [("user_id", 1), ("word", 1)],               # tekrar kelime kontrolü için
        ]
