from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.dependencies import get_current_user, get_word_service
from app.domain.models.user import User
from app.domain.schemas.review import ReviewResponse, ReviewSubmit
from app.services.word_service import WordService

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
async def submit_review(
    data: ReviewSubmit,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    review = await svc.submit_review(
        user_id=str(user.id), word_id=data.word_id, knew_it=data.knew_it
    )
    if review is None:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")
    return ReviewResponse(
        id=str(review.id),
        word_id=data.word_id,
        knew_it=review.knew_it,
        previous_level=review.previous_level,
        new_level=review.new_level,
        previous_interval_days=review.previous_interval_days,
        new_interval_days=review.new_interval_days,
        reviewed_at=review.reviewed_at,
    )
