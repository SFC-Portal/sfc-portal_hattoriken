from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_jwt_audience: str = "authenticated"
    database_url: str = ""
    secret_key: str = "change-me"
    cors_origins: List[str] = ["http://localhost:3000"]
    debug: bool = False
    gemini_api_key: str = ""
    gemini_model: str = "gemma-4-31b-it"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
