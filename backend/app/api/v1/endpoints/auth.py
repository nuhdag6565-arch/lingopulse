from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import get_auth_service, get_current_user
from app.domain.models.user import User
from app.domain.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    svc: AuthService = Depends(get_auth_service),
):
    try:
        user = await svc.register(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return await svc.login(data.email, data.password)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    svc: AuthService = Depends(get_auth_service),
):
    try:
        return await svc.login(data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    svc: AuthService = Depends(get_auth_service),
):
    try:
        return await svc.refresh(data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )
