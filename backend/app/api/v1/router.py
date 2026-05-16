from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.words import router as words_router
from app.api.v1.endpoints.reviews import router as reviews_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(words_router, prefix="/words", tags=["words"])
api_router.include_router(reviews_router, prefix="/reviews", tags=["reviews"])
