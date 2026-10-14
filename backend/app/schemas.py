"""Validated shape of the onboarding profile (stored as JSON)."""
from datetime import date
from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, StringConstraints, field_validator, model_validator

Sex = Literal["female", "male", "unspecified"]
Goal = Literal["build_muscle", "lose_fat", "maintain", "more_energy", "sport_performance"]
Level = Literal["beginner", "intermediate", "advanced"]
Equipment = Literal["full_gym", "dumbbells", "bands", "bodyweight"]
Budget = Literal["tight", "moderate", "flexible"]
Supplement = Literal["protein", "creatine", "pre_workout"]

ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]


class BodyComposition(BaseModel):
    """Optional numbers from a body composition scan (InBody reports muscle in kg; other scales in %)."""

    body_fat_percent: float | None = Field(default=None, ge=2, le=75)
    muscle_value: float | None = Field(default=None, gt=0)
    muscle_unit: Literal["kg", "percent"] = "kg"

    @model_validator(mode="after")
    def check_muscle_range(self) -> Self:
        if self.muscle_value is None:
            return self
        low, high = (10, 70) if self.muscle_unit == "percent" else (5, 150)
        if not low <= self.muscle_value <= high:
            raise ValueError(f"muscle_value must be between {low} and {high} {self.muscle_unit}")
        return self


class CycleInfo(BaseModel):
    # First day of bleeding of the most recent period.
    last_period_start: date | None = None
    # Whole cycle: first day of one period to the first day of the next (typically 21-35; up to 45 in teens).
    average_cycle_days: int | None = Field(default=None, ge=15, le=90)
    # Days of bleeding (typically 2-7).
    period_days: int | None = Field(default=None, ge=1, le=15)
    regularity: Literal["regular", "irregular", "unsure"] | None = None
    # Hormonal pill, IUD, implant, shot or patch: no natural phases to estimate.
    hormonal_contraception: Literal["no", "yes", "prefer_not"] | None = None

    @model_validator(mode="after")
    def period_fits_in_cycle(self) -> Self:
        if self.period_days and self.average_cycle_days and self.period_days >= self.average_cycle_days:
            raise ValueError("period_days must be shorter than average_cycle_days")
        return self

    @field_validator("last_period_start")
    @classmethod
    def not_in_future(cls, value: date | None) -> date | None:
        if value and value > date.today():
            raise ValueError("last_period_start cannot be in the future")
        return value


class ProfileData(BaseModel):
    nickname: ShortText
    age: int = Field(ge=13, le=100)
    sex: Sex = "unspecified"
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float | None = Field(default=None, ge=25, le=350)  # optional: "prefiero no ponerlo"
    body_composition: BodyComposition | None = None
    goals: list[Goal] = Field(min_length=1, max_length=3)
    level: Level
    sports: list[ShortText] = Field(default_factory=list, max_length=8)
    days_per_week: int = Field(ge=1, le=7)
    minutes_per_session: int = Field(ge=10, le=180)
    equipment: list[Equipment] = Field(min_length=1)
    injuries: str = Field(default="", max_length=500)
    track_cycle: bool = False
    cycle: CycleInfo | None = None
    budget: Budget = "moderate"
    dietary_restrictions: str = Field(default="", max_length=300)
    supplements: list[Supplement] = Field(default_factory=list)
