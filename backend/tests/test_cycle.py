from datetime import date, timedelta

import pytest

from app.cycle import describe_cycle
from app.nebius import describe_profile
from app.schemas import CycleInfo, ProfileData

TODAY = date(2026, 6, 15)


def cycle(days_ago: int | None = None, **fields) -> CycleInfo:
    start = TODAY - timedelta(days=days_ago) if days_ago is not None else None
    return CycleInfo(last_period_start=start, **fields)


@pytest.mark.parametrize(
    ("days_ago", "phase"),
    [
        (0, "cycle day 1, estimated phase: period"),
        (4, "cycle day 5, estimated phase: period"),
        (7, "cycle day 8, estimated phase: follicular"),
        (13, "cycle day 14, estimated phase: around ovulation"),
        (18, "cycle day 19, estimated phase: luteal"),
        (25, "cycle day 26, estimated phase: premenstrual"),
    ],
)
def test_estimates_phase_for_a_28_day_cycle(days_ago, phase):
    text = describe_cycle(cycle(days_ago, average_cycle_days=28, period_days=5), age=25, today=TODAY)
    assert phase in text


def test_ovulation_moves_with_cycle_length():
    text = describe_cycle(cycle(20, average_cycle_days=35), age=25, today=TODAY)
    assert "cycle day 21, estimated phase: around ovulation" in text


def test_hormonal_contraception_skips_phases():
    text = describe_cycle(cycle(3, hormonal_contraception="yes"), age=25, today=TODAY)
    assert "no natural phases" in text
    assert "cycle day" not in text


def test_missing_date_means_unknown_phase():
    assert "phase is unknown" in describe_cycle(cycle(average_cycle_days=30), age=25, today=TODAY)


def test_regular_cycle_is_projected_forward():
    text = describe_cycle(cycle(30, average_cycle_days=28, regularity="regular"), age=25, today=TODAY)
    assert "cycle day 3" in text
    assert "projected" in text


def test_overdue_period_is_not_guessed():
    text = describe_cycle(cycle(40, average_cycle_days=28), age=25, today=TODAY)
    assert "may be late" in text
    assert "cycle day" not in text


def test_flags_cycle_outside_typical_range_by_age():
    assert "outside the typical 21-35" in describe_cycle(cycle(average_cycle_days=40), age=25, today=TODAY)
    assert "outside" not in describe_cycle(cycle(average_cycle_days=40), age=15, today=TODAY)


def test_marks_assumed_length_and_irregular_cycles():
    text = describe_cycle(cycle(2, regularity="irregular"), age=25, today=TODAY)
    assert "assumes a 28-day cycle" in text
    assert "may be off" in text


def test_profile_includes_cycle_only_when_opted_in(profile_payload):
    profile_payload["cycle"] = {"last_period_start": "2026-06-11", "average_cycle_days": 28}
    assert "Cycle:" not in describe_profile(ProfileData.model_validate(profile_payload), today=TODAY)
    profile_payload["track_cycle"] = True
    assert "cycle day 5" in describe_profile(ProfileData.model_validate(profile_payload), today=TODAY)


@pytest.mark.parametrize(
    "fields",
    [
        {"average_cycle_days": 10},
        {"average_cycle_days": 91},
        {"period_days": 0},
        {"period_days": 16},
        {"average_cycle_days": 15, "period_days": 15},
        {"regularity": "sometimes"},
    ],
)
def test_rejects_invalid_cycle(client, profile_payload, fields):
    payload = {**profile_payload, "track_cycle": True, "cycle": fields}
    assert client.put("/api/profile", json=payload).status_code == 422


def test_saves_full_cycle(client, profile_payload):
    full = {
        "last_period_start": "2026-10-01",
        "average_cycle_days": 30,
        "period_days": 6,
        "regularity": "regular",
        "hormonal_contraception": "no",
    }
    response = client.put("/api/profile", json={**profile_payload, "track_cycle": True, "cycle": full})
    assert response.status_code == 200
    assert response.json()["cycle"] == full
