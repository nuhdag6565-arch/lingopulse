from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.domain.models.user import User
from app.services.auth_service import AuthService
from app.services.word_service import WordService

_bearer = HTTPBearer()
_auth_service = AuthService()
_word_service = WordService()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> User:
    try:
        return await _auth_service.get_current_user(credentials.credentials)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


def get_word_service() -> WordService:
    return _word_service


def get_auth_service() -> AuthService:
    return _auth_service
