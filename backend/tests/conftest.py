import os

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

# Point the app at a separate test database before any app module reads its settings.
_url = make_url(os.environ["DATABASE_URL"])
if not _url.database.endswith("_test"):
    _url = _url.set(database=f"{_url.database}_test")
os.environ["DATABASE_URL"] = _url.render_as_string(hide_password=False)

from pathlib import Path  # noqa: E402

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.db.session import engine, get_session  # noqa: E402
from app.main import app  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parents[1]


def _create_test_database() -> None:
    admin = create_engine(_url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": _url.database}
        )
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{_url.database}"'))
    admin.dispose()


@pytest.fixture(scope="session")
def alembic_cfg() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    return cfg


@pytest.fixture(scope="session", autouse=True)
def migrated_database(alembic_cfg):
    """Rebuild the test database from migrations once per test run."""
    _create_test_database()
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
    command.upgrade(alembic_cfg, "head")


@pytest.fixture
def db():
    """A session whose changes are rolled back after each test, even committed ones."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False
    )
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_session] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
