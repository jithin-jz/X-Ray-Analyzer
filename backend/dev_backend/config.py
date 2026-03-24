from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    debug: bool = False
    database_url: str = Field(default=..., validation_alias="DATABASE_URL")

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
