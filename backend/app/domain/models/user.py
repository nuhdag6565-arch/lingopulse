from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed
from pydantic import BaseModel as PydanticBaseModel
from pydantic import Field


class UserPreferences(PydanticBaseModel):
    tts_speed: float = 1.0
    tts_accent: str = "us"
    dark_mode: bool = False


class User(Document):
    """Kullanıcı hesabı — şifre hash olarak saklanır, asla plain-text değil."""

    email: Annotated[str, Indexed(unique=True)]
    hashed_password: str | None = None
    full_name: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: datetime | None = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)

    class Settings:
        name = "users"
        indexes = ["email"]
