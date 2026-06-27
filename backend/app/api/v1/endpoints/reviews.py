from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import get_current_user
from app.domain.models.user import User
from app.domain.models.word import Word
from app.domain.schemas.review import ReviewResponse, ReviewSubmit
from app.services.spaced_repetition_service import calculate_next_review

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
async def submit_review(
    data: ReviewSubmit,
    user: User = Depends(get_current_user),
):
    word = await Word.get(data.word_id)
    if word is None or word.user_id != str(user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kelime bulunamadı")

    prev_level = word.learning_level
    prev_interval = word.interval_days

    result = calculate_next_review(
        knew_it=data.knew_it,
        current_level=word.learning_level,
        current_ease_factor=word.ease_factor,
        current_interval_days=word.interval_days,
    )

    now = datetime.now(timezone.utc)
    word.learning_level = result.new_level
    word.ease_factor = result.new_ease_factor
    word.interval_days = result.new_interval_days
    word.next_review_date = now + timedelta(days=result.new_interval_days)
    word.updated_at = now
    await word.save()

    return ReviewResponse(
        id=str(word.id),
        word_id=str(word.id),
        knew_it=data.knew_it,
        previous_level=prev_level,
        new_level=result.new_level,
        previous_interval_days=prev_interval,
        new_interval_days=result.new_interval_days,
        reviewed_at=now,
    )
