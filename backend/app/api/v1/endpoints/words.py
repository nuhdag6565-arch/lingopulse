from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.api.v1.dependencies import get_current_user, get_word_service
from app.core.rate_limit import limiter
from app.domain.models.user import User
from app.domain.schemas.word import WordCreate, WordListResponse, WordResponse, WordUpdate
from app.services.word_service import WordService

router = APIRouter()


def _to_response(word) -> WordResponse:
    return WordResponse(
        id=str(word.id),
        list_id=word.list_id,
        word=word.word,
        meaning=word.meaning,
        example_sentence=word.example_sentence,
        example_sentence_translation=word.example_sentence_translation,
        learning_level=word.learning_level,
        ease_factor=word.ease_factor,
        interval_days=word.interval_days,
        next_review_date=word.next_review_date,
        created_at=word.created_at,
        updated_at=word.updated_at,
    )


@router.get("/", response_model=WordListResponse)
async def list_words(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    list_id: str | None = Query(None),
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    items, total = await svc.word_repo.list_all(
        user_id=str(user.id), page=page, size=size, list_id=list_id
    )
    return WordListResponse(items=[_to_response(w) for w in items], total=total, page=page, size=size)


@router.post("/", response_model=WordResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_word(
    request: Request,
    data: WordCreate,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    word = await svc.create_word(user_id=str(user.id), data=data)
    return _to_response(word)


@router.get("/due", response_model=list[WordResponse])
async def get_due_words(
    limit: int = Query(20, ge=1, le=50),
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    items = await svc.word_repo.find_due(user_id=str(user.id), limit=limit)
    return [_to_response(w) for w in items]


@router.get("/{word_id}", response_model=WordResponse)
async def get_word(
    word_id: str,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    word = await svc.word_repo.get_by_id(word_id)
    if word is None or word.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")
    return _to_response(word)


@router.patch("/{word_id}", response_model=WordResponse)
async def update_word(
    word_id: str,
    data: WordUpdate,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    word = await svc.update_word(user_id=str(user.id), word_id=word_id, data=data)
    if word is None:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")
    return _to_response(word)


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_word(
    word_id: str,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    deleted = await svc.delete_word(user_id=str(user.id), word_id=word_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")


@router.post("/{word_id}/regenerate-example", response_model=WordResponse)
async def regenerate_example(
    word_id: str,
    svc: WordService = Depends(get_word_service),
    user: User = Depends(get_current_user),
):
    word = await svc.regenerate_example(user_id=str(user.id), word_id=word_id)
    if word is None:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")
    return _to_response(word)
