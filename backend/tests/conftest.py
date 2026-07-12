import os
from pathlib import Path

db_path = Path(__file__).parent.parent / "test_api.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{db_path.absolute()}")
os.environ.setdefault("OPENROUTER_API_KEY", "test-key")
os.environ.setdefault("OPENROUTER_AI_MODEL", "test-model")

import pytest


@pytest.fixture(autouse=True)
def setup_db():
    from backend.database import Base, engine

    engine.dispose()
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if db_path.exists():
        try:
            db_path.unlink()
        except OSError:
            pass


@pytest.fixture
def client():
    from backend.main import app
    from fastapi.testclient import TestClient

    return TestClient(app)
