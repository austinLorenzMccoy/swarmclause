from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SwarmClause Backend"
    groq_api_key: str | None = None
    hedera_operator_id: str | None = None
    hedera_operator_key: str | None = None
    hedera_topic_id: str | None = None
    supabase_url: str | None = None
    supabase_key: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
