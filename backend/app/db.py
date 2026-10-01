"""Database engine, tables and session dependency (SQLite locally, Supabase Postgres when configured)."""
from collections.abc import Iterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import JSON, DateTime, String, create_engine, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from app.config import settings


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class Profile(Base):
    """One row per user; the validated profile lives in `data` so fields can evolve without migrations."""

    __tablename__ = "profiles"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    data: Mapped[dict[str, Any]] = mapped_column(JSON().with_variant(JSONB(), "postgresql"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


def _make_engine():
    if settings.database_url.startswith("sqlite"):
        Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
        # FastAPI runs sync endpoints in a threadpool.
        return create_engine(settings.database_url, connect_args={"check_same_thread": False})
    # Poolers close idle connections; pre-ping replaces dead ones transparently.
    return create_engine(settings.database_url, pool_pre_ping=True)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)
    if engine.dialect.name == "postgresql":
        # Supabase exposes the public schema through its Data API; RLS with no policies closes that door.
        # The backend connects as the table owner, so its own queries are unaffected.
        with engine.begin() as conn:
            for table in Base.metadata.sorted_tables:
                conn.execute(text(f'ALTER TABLE "{table.name}" ENABLE ROW LEVEL SECURITY'))


def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
