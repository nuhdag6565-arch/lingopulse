from datetime import datetime

from pydantic import BaseModel, Field


class WordListCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=500)


class WordListUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None


class WordListResponse(BaseModel):
    id: str
    name: str
    description: str
    word_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WordListsResponse(BaseModel):
    items: list[WordListResponse]
    total: int
