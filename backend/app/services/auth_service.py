"""Kullanıcı kaydı, giriş ve token yenileme iş mantığı."""

from datetime import datetime, timezone

from jose import JWTError

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    decode_token,
)
from app.domain.models.user import User
from app.domain.schemas.auth import RegisterRequest, TokenResponse


class AuthService:
    async def register(self, data: RegisterRequest) -> User:
        existing = await User.find_one(User.email == data.email)
        if existing:
            raise ValueError("Bu e-posta adresi zaten kayıtlı.")
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        await user.save()
        return user

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await User.find_one(User.email == email)
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("E-posta veya şifre hatalı.")
        if not user.is_active:
            raise ValueError("Hesap devre dışı.")
        user.last_login = datetime.now(timezone.utc)
        await user.save()
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise ValueError("Geçersiz veya süresi dolmuş token.")
        if payload.get("type") != "refresh":
            raise ValueError("Geçersiz token türü.")
        user_id = payload.get("sub")
        user = await User.get(user_id)
        if not user or not user.is_active:
            raise ValueError("Kullanıcı bulunamadı.")
        return TokenResponse(
            access_token=create_access_token(user_id),
            refresh_token=create_refresh_token(user_id),
        )

    async def get_current_user(self, token: str) -> User:
        try:
            payload = decode_token(token)
        except JWTError:
            raise ValueError("Geçersiz token.")
        if payload.get("type") != "access":
            raise ValueError("Geçersiz token türü.")
        user = await User.get(payload["sub"])
        if not user or not user.is_active:
            raise ValueError("Kullanıcı bulunamadı.")
        return user
