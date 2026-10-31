from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://radmap:change-me@localhost:5432/radmap"
    frontend_origins: str = "http://localhost:3000"
    gemma_base_url: str = "http://host.docker.internal:11434/v1"
    gemma_api_key: str = ""
    gemma_model: str = "gemma4"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
