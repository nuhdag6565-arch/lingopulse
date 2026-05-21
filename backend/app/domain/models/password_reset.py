from datetime import datetime, timezone, timedelta
from beanie import Document
from pydantic import Field


class PasswordResetCode(Document):
    email: str
    code: str
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    class Settings:
        name = "password_reset_codes"
        indexes = ["email"]
