from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from app.domain.models.word import Word


class Review(Document):
    """Immutable event log of each flashcard review session."""

    word: Link[Word]
    knew_it: bool
    previous_level: int
    new_level: int
    previous_interval_days: int
    new_interval_days: int
    reviewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reviews"
        indexes = ["reviewed_at"]
