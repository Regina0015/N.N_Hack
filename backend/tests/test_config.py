import pytest

from app.config import resolve_database_url


def test_empty_url_falls_back_to_local_sqlite():
    assert resolve_database_url("").startswith("sqlite:///")
    assert resolve_database_url("").endswith("/data/dev.db")


@pytest.mark.parametrize("scheme", ["postgresql://", "postgres://", "postgresql+psycopg://"])
def test_supabase_urls_use_psycopg_driver(scheme):
    rest = "postgres.ref:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    assert resolve_database_url(scheme + rest) == "postgresql+psycopg://" + rest
