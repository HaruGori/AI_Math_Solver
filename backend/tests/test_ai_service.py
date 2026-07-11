import os
from pathlib import Path

os.environ.setdefault("OPENROUTER_API_KEY", "test-key")
os.environ.setdefault("OPENROUTER_AI_MODEL", "test-model")

db_path = Path(__file__).parent.parent / "test_api.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{db_path.absolute()}")

from unittest.mock import patch, MagicMock
import pytest
from openai import RateLimitError, APIConnectionError, InternalServerError

from backend.services.ai_service import generate_answer, AIGenerationError


@patch("backend.services.ai_service.client.chat.completions.create")
def test_generate_answer_success(mock_create):
    mock_choice = MagicMock()
    mock_choice.message.content = "x = 2"
    mock_create.return_value.choices = [mock_choice]

    result = generate_answer("Solve x + 2 = 4")
    assert result == "x = 2"
    mock_create.assert_called_once()


@patch("backend.services.ai_service.client.chat.completions.create")
def test_generate_answer_empty_content(mock_create):
    mock_choice = MagicMock()
    mock_choice.message.content = None
    mock_create.return_value.choices = [mock_choice]

    result = generate_answer("test")
    assert result == ""


def test_generate_answer_empty_input():
    result = generate_answer("")
    assert result == ""


@patch("backend.services.ai_service.client.chat.completions.create")
def test_generate_answer_rate_limit_raises_exception(mock_create):
    mock_create.side_effect = RateLimitError(
        message="Rate limited",
        response=MagicMock(status_code=429),
        body={"error": {"message": "Rate limited"}},
    )

    with pytest.raises(AIGenerationError) as excinfo:
        generate_answer("test")

    assert excinfo.value.code == "RATE_LIMIT_EXCEEDED"
    assert excinfo.value.retry_after == 60


@patch("backend.services.ai_service.client.chat.completions.create")
def test_generate_answer_connection_error_raises_exception(mock_create):
    mock_create.side_effect = APIConnectionError(message="Connection failed", request=MagicMock())

    with pytest.raises(AIGenerationError) as excinfo:
        generate_answer("test")

    assert excinfo.value.code == "AI_SERVICE_UNAVAILABLE"


@patch("backend.services.ai_service.client.chat.completions.create")
def test_generate_answer_internal_error_raises_exception(mock_create):
    mock_create.side_effect = InternalServerError(
        message="Internal error",
        response=MagicMock(status_code=500),
        body={"error": {"message": "Internal error"}},
    )

    with pytest.raises(AIGenerationError) as excinfo:
        generate_answer("test")

    assert excinfo.value.code == "AI_SERVICE_ERROR"
    assert excinfo.value.retry_after == 30
