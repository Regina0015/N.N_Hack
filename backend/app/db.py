"""Database engine, tables and session dependency (SQLite locally, Supabase Postgres when configured)."""
from collections.abc import Iterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import JSON, BigInteger, DateTime, Index, Integer, String, Text, create_engine, inspect
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


class Message(Base):
    """One chat turn; the coach's memory is the user's most recent turns, read back in id order."""

    __tablename__ = "chat_messages"
    __table_args__ = (Index("chat_messages_user_id_id_idx", "user_id", "id"),)

    # BIGINT identity on Postgres; SQLite only autoincrements INTEGER primary keys.
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer(), "sqlite"), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64))
    role: Mapped[str] = mapped_column(String(16))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


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
    """Creates tables for local SQLite; on Supabase the schema belongs to backend/supabase/migrations."""
    if engine.dialect.name == "sqlite":
        Base.metadata.create_all(engine)
        return
    existing = inspect(engine)
    missing = [t.name for t in Base.metadata.sorted_tables if not existing.has_table(t.name)]
    if missing:
        raise RuntimeError(
            f"Missing tables {missing}: apply backend/supabase/migrations "
            "(push to main with the Supabase GitHub integration, or `npx supabase db push`)."
        )


def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
