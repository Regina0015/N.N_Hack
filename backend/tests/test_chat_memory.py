import pytest

from app.deps import get_current_user_id
from app.main import app
from app.routers import coach


@pytest.fixture
def captured(monkeypatch):
    """Records what the model receives; replies with the turn number so replies are distinguishable."""
    calls: list[list[dict[str, str]]] = []

    async def fake_reply(messages, profile=None):
        calls.append(messages)
        return f"respuesta {len(calls)}"

    monkeypatch.setattr(coach, "coach_reply", fake_reply)
    return calls


def say(client, text):
    return client.post("/api/coach/chat", json={"message": text})


def history(client):
    return [(m["role"], m["content"]) for m in client.get("/api/coach/history").json()["messages"]]


def test_chat_saves_both_turns(client, captured):
    assert say(client, "Hola").json()["reply"] == "respuesta 1"
    assert history(client) == [("user", "Hola"), ("assistant", "respuesta 1")]


def test_model_receives_earlier_turns(client, captured):
    say(client, "Juego fútbol los sábados")
    say(client, "¿Qué entreno hoy?")
    assert captured[1] == [
        {"role": "user", "content": "Juego fútbol los sábados"},
        {"role": "assistant", "content": "respuesta 1"},
        {"role": "user", "content": "¿Qué entreno hoy?"},
    ]


def test_model_context_is_capped(client, captured, monkeypatch):
    monkeypatch.setattr(coach, "CONTEXT_MESSAGES", 3)
    for text in ["uno", "dos", "tres"]:
        say(client, text)
    assert [m["content"] for m in captured[-1]] == ["dos", "respuesta 2", "tres"]


def test_provider_error_saves_nothing(client, monkeypatch):
    async def broken(messages, profile=None):
        raise TimeoutError

    monkeypatch.setattr(coach, "coach_reply", broken)
    assert say(client, "Hola").status_code == 502
    assert history(client) == []


def test_clear_history(client, captured):
    say(client, "Hola")
    assert client.delete("/api/coach/history").status_code == 204
    assert history(client) == []


def test_history_is_per_user(client, captured):
    say(client, "mensaje de la usuaria local")
    app.dependency_overrides[get_current_user_id] = lambda: "otra-usuaria"
    try:
        assert history(client) == []
    finally:
        app.dependency_overrides.pop(get_current_user_id)


def test_rejects_blank_message(client, captured):
    assert say(client, "   ").status_code == 422
    assert captured == []
