from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import get_current_user, get_word_list_service
from app.domain.models.user import User
from app.domain.models.word import Word
from app.domain.models.word_list import WordList
from app.domain.schemas.word_list import (
    WordListCreate,
    WordListResponse,
    WordListsResponse,
    WordListUpdate,
)
from app.services.word_list_service import WordListService

router = APIRouter()


def _to_response(wl: WordList, word_count: int = 0) -> WordListResponse:
    return WordListResponse(
        id=str(wl.id),
        name=wl.name,
        description=wl.description,
        word_count=word_count,
        created_at=wl.created_at,
        updated_at=wl.updated_at,
    )


@router.get("/", response_model=WordListsResponse)
async def list_word_lists(
    svc: WordListService = Depends(get_word_list_service),
    user: User = Depends(get_current_user),
):
    lists = await svc.get_lists(user_id=str(user.id))
    items = []
    for wl in lists:
        count = await Word.find(Word.list_id == str(wl.id)).count()
        items.append(_to_response(wl, count))
    return WordListsResponse(items=items, total=len(items))


@router.post("/", response_model=WordListResponse, status_code=status.HTTP_201_CREATED)
async def create_word_list(
    data: WordListCreate,
    svc: WordListService = Depends(get_word_list_service),
    user: User = Depends(get_current_user),
):
    wl = await svc.create_list(user_id=str(user.id), data=data)
    return _to_response(wl, 0)


@router.get("/{list_id}", response_model=WordListResponse)
async def get_word_list(
    list_id: str,
    svc: WordListService = Depends(get_word_list_service),
    user: User = Depends(get_current_user),
):
    wl = await svc.get_list(user_id=str(user.id), list_id=list_id)
    if wl is None:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    count = await Word.find(Word.list_id == list_id).count()
    return _to_response(wl, count)


@router.patch("/{list_id}", response_model=WordListResponse)
async def update_word_list(
    list_id: str,
    data: WordListUpdate,
    svc: WordListService = Depends(get_word_list_service),
    user: User = Depends(get_current_user),
):
    wl = await svc.update_list(user_id=str(user.id), list_id=list_id, data=data)
    if wl is None:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    count = await Word.find(Word.list_id == list_id).count()
    return _to_response(wl, count)


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_word_list(
    list_id: str,
    svc: WordListService = Depends(get_word_list_service),
    user: User = Depends(get_current_user),
):
    deleted = await svc.delete_list(user_id=str(user.id), list_id=list_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
