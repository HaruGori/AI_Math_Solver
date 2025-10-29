from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    # Example for Neon: "postgresql://user:password@host:port/dbname"
    database_url: str

    # OpenRouter
    openrouter_api_key: str
    openrouter_ai_model: str
    
    class Config:
        env_file = "backend/.env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
