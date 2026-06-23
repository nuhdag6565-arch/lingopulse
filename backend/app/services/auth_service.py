import asyncio
import logging
import random
import string
from datetime import datetime, timezone

from jose import JWTError
from app.core.firebase_admin_init import init_firebase, is_firebase_enabled

logger = logging.getLogger(__name__)

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    decode_token,
)
from app.core.email import send_reset_email
from app.domain.models.user import User
from app.domain.models.password_reset import PasswordResetCode
from app.domain.schemas.auth import RegisterRequest, TokenResponse


def _generate_code(length: int = 4) -> str:
    return "".join(random.choices(string.digits, k=length))


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
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
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

    async def forgot_password(self, email: str) -> None:
        # Kullanıcı yoksa sessizce geç — e-posta numaralandırmasını önle
        user = await User.find_one(User.email == email)
        if not user or not user.is_active:
            return

        # Önceki kodları temizle
        await PasswordResetCode.find(PasswordResetCode.email == email).delete()

        code = _generate_code()
        await PasswordResetCode(email=email, code=code).save()
        try:
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, send_reset_email, email, code)
        except Exception as exc:
            # E-posta gönderilemese de kod kaydedildi; loglayıp devam et
            logger.error("Sıfırlama e-postası gönderilemedi (%s): %s", email, exc)

    async def verify_firebase_token(self, id_token: str, full_name: str = "") -> TokenResponse:
        init_firebase()
        if not is_firebase_enabled():
            raise ValueError("Firebase Auth yapılandırılmamış.")
        from firebase_admin import auth as firebase_auth
        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as exc:
            raise ValueError(f"Geçersiz Firebase token: {exc}")
        email = decoded.get("email")
        if not email:
            raise ValueError("Firebase token'da e-posta bulunamadı.")
        user = await User.find_one(User.email == email)
        if not user:
            user = User(
                email=email,
                full_name=full_name or decoded.get("name", ""),
            )
            await user.save()
        user.last_login = datetime.now(timezone.utc)
        await user.save()
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def reset_password(self, email: str, code: str, new_password: str) -> None:
        record = await PasswordResetCode.find_one(
            PasswordResetCode.email == email,
            PasswordResetCode.code == code,
        )
        if record is None:
            raise ValueError("Kod hatalı veya geçersiz.")
        if record.expires_at < datetime.now(timezone.utc):
            await record.delete()
            raise ValueError("Kodun süresi dolmuş. Lütfen yeni kod isteyin.")

        user = await User.find_one(User.email == email)
        if not user:
            raise ValueError("Kullanıcı bulunamadı.")

        user.hashed_password = hash_password(new_password)
        await user.save()
        await record.delete()
