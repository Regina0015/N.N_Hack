"""Throwaway SQLite DB and forced mock mode, so tests never touch Supabase or spend Nebius credits.

The environment must be set before `app` is imported (settings are read at import time,
and python-dotenv never overrides variables that already exist).
"""
import os
import shutil
import tempfile
from pathlib import Path

_TMP_DIR = Path(tempfile.mkdtemp(prefix="coach-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_TMP_DIR / 'test.db').as_posix()}"
os.environ["NEBIUS_API_KEY"] = ""
os.environ["COACH_MODEL"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import delete  # noqa: E402

from app.db import Message, Profile, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _remove_test_db():
    yield
    engine.dispose()
    shutil.rmtree(_TMP_DIR, ignore_errors=True)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        with SessionLocal() as session:
            session.execute(delete(Profile))
            session.execute(delete(Message))
            session.commit()
        yield test_client


@pytest.fixture
def profile_payload() -> dict:
    return {
        "nickname": "Demo",
        "age": 21,
        "sex": "female",
        "height_cm": 165,
        "weight_kg": 60,
        "goals": ["build_muscle", "more_energy"],
        "level": "beginner",
        "sports": ["fútbol"],
        "days_per_week": 4,
        "minutes_per_session": 60,
        "equipment": ["dumbbells"],
    }
