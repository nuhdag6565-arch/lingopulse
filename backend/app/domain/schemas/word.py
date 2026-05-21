from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WordCreate(BaseModel):
    list_id: str = Field(..., min_length=1)
    word: str = Field(..., min_length=1, max_length=100)
    meaning: str = Field(..., min_length=1, max_length=500)


class WordUpdate(BaseModel):
    meaning: Optional[str] = Field(None, min_length=1, max_length=500)
    example_sentence: Optional[str] = None
    example_sentence_translation: Optional[str] = None


class WordResponse(BaseModel):
    id: str
    list_id: str | None
    word: str
    meaning: str
    example_sentence: str
    example_sentence_translation: str
    learning_level: int
    ease_factor: float
    interval_days: int
    next_review_date: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WordListResponse(BaseModel):
    items: list[WordResponse]
    total: int
    page: int
    size: int
