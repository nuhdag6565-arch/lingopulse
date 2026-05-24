from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies import get_current_user
from app.core.security import hash_password, verify_password
from app.domain.models.user import User, UserPreferences
from app.domain.schemas.auth import (
    ChangePasswordRequest,
    PreferencesResponse,
    UpdatePreferencesRequest,
    UpdateProfileRequest,
    UserResponse,
)

router = APIRouter()


def _to_response(user: User) -> UserResponse:
    # Existing users (before preferences migration) may have preferences=None
    prefs = user.preferences if user.preferences is not None else UserPreferences()
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        preferences=PreferencesResponse(
            tts_speed=prefs.tts_speed,
            tts_accent=prefs.tts_accent,
            dark_mode=prefs.dark_mode,
        ),
    )


@router.put("/me/password", status_code=status.HTTP_200_OK)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifre yanlış.",
        )
    current_user.hashed_password = hash_password(data.new_password)
    await current_user.save()
    return {"message": "Şifre başarıyla güncellendi."}


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.email is not None:
        existing = await User.find_one(User.email == data.email)
        if existing and str(existing.id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu e-posta zaten kullanılıyor.",
            )
        current_user.email = data.email
    await current_user.save()
    return _to_response(current_user)


@router.put("/me/preferences", response_model=UserResponse)
async def update_preferences(
    data: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
):
    # Guard against missing preferences for users created before the migration
    prefs = current_user.preferences if current_user.preferences is not None else UserPreferences()
    if data.tts_speed is not None:
        prefs.tts_speed = data.tts_speed
    if data.tts_accent is not None:
        prefs.tts_accent = data.tts_accent
    if data.dark_mode is not None:
        prefs.dark_mode = data.dark_mode
    current_user.preferences = prefs
    await current_user.save()
    return _to_response(current_user)
