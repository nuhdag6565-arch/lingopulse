from datetime import datetime

from pydantic import BaseModel


class ReviewSubmit(BaseModel):
    word_id: str
    knew_it: bool


class ReviewResponse(BaseModel):
    id: str
    word_id: str
    knew_it: bool
    previous_level: int
    new_level: int
    previous_interval_days: int
    new_interval_days: int
    reviewed_at: datetime
