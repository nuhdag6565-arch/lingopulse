from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.dependencies import get_word_service
from app.domain.schemas.word import WordCreate, WordListResponse, WordResponse, WordUpdate
from app.services.word_service import WordService

router = APIRouter()


def _to_response(word) -> WordResponse:
    return WordResponse(
        id=str(word.id),
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
    size: int = Query(20, ge=1, le=100),
    svc: WordService = Depends(get_word_service),
):
    items, total = await svc.word_repo.list_all(page=page, size=size)
    return WordListResponse(
        items=[_to_response(w) for w in items],
        total=total,
        page=page,
        size=size,
    )


@router.post("/", response_model=WordResponse, status_code=status.HTTP_201_CREATED)
async def create_word(
    data: WordCreate,
    svc: WordService = Depends(get_word_service),
):
    word = await svc.create_word(data)
    return _to_response(word)


@router.get("/due", response_model=list[WordResponse])
async def get_due_words(
    limit: int = Query(20, ge=1, le=50),
    svc: WordService = Depends(get_word_service),
):
    items = await svc.word_repo.find_due(limit=limit)
    return [_to_response(w) for w in items]


@router.get("/{word_id}", response_model=WordResponse)
async def get_word(
    word_id: str,
    svc: WordService = Depends(get_word_service),
):
    word = await svc.word_repo.get_by_id(word_id)
    if word is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return _to_response(word)


@router.patch("/{word_id}", response_model=WordResponse)
async def update_word(
    word_id: str,
    data: WordUpdate,
    svc: WordService = Depends(get_word_service),
):
    word = await svc.update_word(word_id, data)
    if word is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return _to_response(word)


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_word(
    word_id: str,
    svc: WordService = Depends(get_word_service),
):
    deleted = await svc.delete_word(word_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Word not found")


@router.post("/{word_id}/regenerate-example", response_model=WordResponse)
async def regenerate_example(
    word_id: str,
    svc: WordService = Depends(get_word_service),
):
    word = await svc.regenerate_example(word_id)
    if word is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return _to_response(word)
