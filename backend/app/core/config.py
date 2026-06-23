from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "LinguaAI"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "change-me-use-a-long-random-string-in-production"

    mongo_uri: str = "mongodb://localhost:27017/langlearn"
    mongo_db: str = "langlearn"

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ai_provider: str = "openai"
    ai_model: str = "gpt-4o-mini"

    cors_origins: str = "http://localhost:8081"

    # Firebase Auth
    firebase_project_id: str = ""
    firebase_service_account_json: str = ""

    # E-posta / SMTP (isteğe bağlı — boş bırakılırsa kod konsola yazdırılır)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
