from app.nebius import describe_profile
from app.schemas import ProfileData

HELLO = {"messages": [{"role": "user", "content": "Hola"}]}


def test_chat_without_profile_runs_in_mock_mode(client):
    response = client.post("/api/coach/chat", json=HELLO)
    assert response.status_code == 200
    assert response.json()["mock"] is True


def test_chat_uses_profile(client, profile_payload):
    client.put("/api/profile", json=profile_payload)
    assert "Demo" in client.post("/api/coach/chat", json=HELLO).json()["reply"]


def test_describe_profile_respects_unshared_weight(profile_payload):
    del profile_payload["weight_kg"]
    assert "Weight: not shared" in describe_profile(ProfileData.model_validate(profile_payload))


def test_describe_profile_includes_body_composition(profile_payload):
    profile_payload["body_composition"] = {"body_fat_percent": 24.5, "muscle_value": 26.1, "muscle_unit": "kg"}
    text = describe_profile(ProfileData.model_validate(profile_payload))
    assert "Body fat: 24.5%" in text
    assert "Muscle mass: 26.1 kg" in text
