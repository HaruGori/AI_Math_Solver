from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    # Example for Neon: "postgresql://user:password@host:port/dbname"
    database_url: str
    database_echo: bool = False

    # OpenRouter
    openrouter_api_key: str
    openrouter_ai_model: str

    # CORS
    # カンマ区切りで複数指定可。デフォルトは全許可（開発用）
    cors_origins: str = "*"

    # AI リトライ設定
    ai_max_retries: int = 3
    ai_retry_base_delay: float = 1.0
    ai_retry_max_delay: float = 10.0
    ai_timeout: float = 30.0

    class Config:
        env_file = "backend/.env.local"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
