from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IncidentPilot API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://incidentpilot:incidentpilot@localhost:5432/incidentpilot"
    demo_mode: bool = True
    gemini_api_key: str | None = None
    cors_origins: str = "http://localhost:3000"
    max_tool_calls: int = 10
    max_tool_results: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
