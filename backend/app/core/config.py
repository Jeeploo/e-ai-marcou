import os
from pathlib import Path

from dotenv import dotenv_values
from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = Field(default="e aí, marcou?", min_length=1)


def load_settings() -> Settings:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    values = dotenv_values(env_path)
    return Settings(
        app_name=os.environ.get("APP_NAME") or values.get("APP_NAME") or "e aí, marcou?"
    )


settings = load_settings()
