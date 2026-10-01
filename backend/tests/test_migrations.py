from pathlib import Path

from app.db import Base

MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "supabase" / "migrations"


def test_every_table_has_a_supabase_migration_with_rls():
    sql = "\n".join(p.read_text(encoding="utf-8").lower() for p in MIGRATIONS_DIR.glob("*.sql"))
    for table in Base.metadata.sorted_tables:
        assert f"create table public.{table.name}" in sql, f"no migration creates {table.name}"
        assert f"alter table public.{table.name} enable row level security" in sql, f"RLS missing on {table.name}"
