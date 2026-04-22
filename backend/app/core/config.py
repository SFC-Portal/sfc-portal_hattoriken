from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    database_url: str = ""
    secret_key: str = "change-me"
    cors_origins: List[str] = ["http://localhost:3000"]
    debug: bool = False

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
