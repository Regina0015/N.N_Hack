"""Settings loaded from backend/.env (never commit that file)."""
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent
LOCAL_SQLITE_PATH = BACKEND_DIR / "data" / "dev.db"


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def resolve_database_url(raw: str) -> str:
    """Empty → local SQLite file. Supabase URIs get the psycopg (v3) driver SQLAlchemy needs."""
    if not raw:
        return f"sqlite:///{LOCAL_SQLITE_PATH.as_posix()}"
    for scheme in ("postgresql://", "postgres://"):
        if raw.startswith(scheme):
            return "postgresql+psycopg://" + raw.removeprefix(scheme)
    return raw


@dataclass(frozen=True)
class Settings:
    nebius_api_key: str = os.getenv("NEBIUS_API_KEY", "")
    nebius_base_url: str = os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.nebius.com/v1/")
    # Copy the exact model IDs from the Token Factory catalog.
    coach_model: str = os.getenv("COACH_MODEL", "")
    vision_model: str = os.getenv("VISION_MODEL", "")
    database_url: str = resolve_database_url(os.getenv("DATABASE_URL", ""))
    cors_origins: list[str] = field(
        default_factory=lambda: _csv(os.getenv("CORS_ORIGINS", "http://localhost:3000"))
    )

    @property
    def mock_mode(self) -> bool:
        """True until a Nebius key and coach model are configured."""
        return not (self.nebius_api_key and self.coach_model)


settings = Settings()
