import os
from pathlib import Path

from dotenv import dotenv_values
from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = Field(default="e aí, marcou?", min_length=1)
    cors_origins: list[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ])
    firebase_credentials: str | None = None
    firebase_project_id: str | None = None


def load_settings() -> Settings:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    values = dotenv_values(env_path)

    cors_raw = os.environ.get("CORS_ORIGINS") or values.get("CORS_ORIGINS")
    cors_origins = (
        [origin.strip() for origin in cors_raw.split(",") if origin.strip()]
        if cors_raw
        else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    return Settings(
        app_name=os.environ.get("APP_NAME") or values.get("APP_NAME") or "e aí, marcou?",
        cors_origins=cors_origins,
        firebase_credentials=os.environ.get(
            "FIREBASE_CREDENTIALS", values.get("FIREBASE_CREDENTIALS")
        ),
        firebase_project_id=os.environ.get(
            "FIREBASE_PROJECT_ID", values.get("FIREBASE_PROJECT_ID")
        ),
    )


settings = load_settings()
