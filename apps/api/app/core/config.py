from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StillMind API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Internal service key (for /internal/* endpoints)
    INTERNAL_SERVICE_KEY: str = secrets.token_urlsafe(32)

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://stillmind:stillmind_secret@localhost:5432/stillmind"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Email (SMTP)
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@stillmind.edu"
    SMTP_FROM_NAME: str = "StillMind"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Rate limiting (requests per minute)
    RATE_LIMIT_LOGIN: int = 10
    RATE_LIMIT_REGISTER: int = 5

    # Risk engine defaults (overridable by admin config)
    RISK_CRI_YELLOW_MIN: float = 0.30
    RISK_CRI_RED_MIN: float = 0.60
    RISK_CRI_WEIGHTS: dict = {
        "phq9": 0.45,
        "gad7": 0.35,
        "behavioral": 0.20,
    }

    # Priority score weights
    PRIORITY_WEIGHTS: dict = {
        "cri": 0.5,
        "trend": 0.2,
        "engagement": 0.2,
        "time_gap": 0.1,
    }

    # Slot confirmation deadline (hours before slot)
    SLOT_CONFIRM_DEADLINE_HOURS: int = 12

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
