from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    """Kullanıcı hesabı — şifre hash olarak saklanır, asla plain-text değil."""

    email: Annotated[str, Indexed(unique=True)]
    hashed_password: str
    full_name: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: datetime | None = None

    class Settings:
        name = "users"
        indexes = ["email"]
