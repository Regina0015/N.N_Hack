import pytest


def test_get_returns_404_without_profile(client):
    assert client.get("/api/profile").status_code == 404


def test_save_and_read_profile(client, profile_payload):
    saved = client.put("/api/profile", json=profile_payload)
    assert saved.status_code == 200
    assert client.get("/api/profile").json() == saved.json()


def test_weight_is_optional(client, profile_payload):
    del profile_payload["weight_kg"]
    response = client.put("/api/profile", json=profile_payload)
    assert response.status_code == 200
    assert response.json()["weight_kg"] is None


def test_save_overwrites_previous_profile(client, profile_payload):
    client.put("/api/profile", json=profile_payload)
    client.put("/api/profile", json={**profile_payload, "days_per_week": 2})
    assert client.get("/api/profile").json()["days_per_week"] == 2


def test_accepts_inbody_style_body_composition(client, profile_payload):
    body = {"body_fat_percent": 24.5, "muscle_value": 26.1, "muscle_unit": "kg"}
    response = client.put("/api/profile", json={**profile_payload, "body_composition": body})
    assert response.status_code == 200
    assert response.json()["body_composition"] == body


@pytest.mark.parametrize(
    "changes",
    [
        {"age": 8},
        {"goals": []},
        {"equipment": []},
        {"nickname": "   "},
        {"body_composition": {"muscle_value": 90, "muscle_unit": "percent"}},
        {"body_composition": {"body_fat_percent": 1}},
        {"track_cycle": True, "cycle": {"last_period_start": "2999-01-01"}},
    ],
)
def test_rejects_invalid_values(client, profile_payload, changes):
    assert client.put("/api/profile", json={**profile_payload, **changes}).status_code == 422
