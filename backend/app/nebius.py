"""Thin wrapper around Nebius Token Factory (OpenAI-compatible API)."""
from datetime import date

from openai import AsyncOpenAI

from app.config import settings
from app.cycle import CYCLE_GUIDANCE, describe_cycle
from app.schemas import ProfileData

COACH_SYSTEM_PROMPT = """You are a warm, encouraging personal wellness coach.

How you talk:
- Offer, never order. Present every adjustment as an optional invitation and make clear that either choice is fine.
  Example: "Si hoy quieres una rutina ligera, hazla sin culpa. Y si te sientes con energía para la normal, también está perfecto."
- No guilt, shame or moralizing about food, cravings, rest days, weight or skipped workouts.
- Never comment negatively on the user's body. Talk about weight only if the user brings it up
  or a calculation they asked for needs it.

What you do:
- Build gym routines that respect the user's sports, equipment, injuries, energy, sleep and cycle.
- Never recommend extreme diets. When giving health advice, remind the user you are not a substitute
  for a doctor or nutritionist.
- If the user is under 18, do not suggest pre-workout or creatine; prefer food-first advice and suggest
  talking with a health professional.

Reply in the user's language, briefly and warmly."""

_GOALS = {
    "build_muscle": "build muscle",
    "lose_fat": "lose fat",
    "maintain": "maintain",
    "more_energy": "have more energy",
    "sport_performance": "perform better in their sport",
}
_EQUIPMENT = {"full_gym": "full gym", "dumbbells": "dumbbells", "bands": "resistance bands", "bodyweight": "bodyweight only"}
_BUDGET = {"tight": "tight (favor cheap meals)", "moderate": "moderate", "flexible": "flexible"}
_SUPPLEMENTS = {"protein": "protein powder", "creatine": "creatine", "pre_workout": "pre-workout"}


def describe_profile(p: ProfileData, today: date | None = None) -> str:
    """Compact profile summary appended to the system prompt."""
    lines = [f"Name to use: {p.nickname}", f"Age: {p.age}"]
    if p.sex != "unspecified":
        lines.append(f"Sex: {p.sex}")
    lines.append(f"Height: {p.height_cm:g} cm")
    if p.weight_kg is None:
        lines.append("Weight: not shared — don't ask for it or set weight-based targets unless the user brings it up")
    else:
        lines.append(f"Weight: {p.weight_kg:g} kg")
    if bc := p.body_composition:
        if bc.body_fat_percent is not None:
            lines.append(f"Body fat: {bc.body_fat_percent:g}%")
        if bc.muscle_value is not None:
            lines.append(f"Muscle mass: {bc.muscle_value:g}{'%' if bc.muscle_unit == 'percent' else ' kg'}")
    lines.append("Goals: " + ", ".join(_GOALS[g] for g in p.goals))
    lines.append(f"Training level: {p.level}")
    if p.sports:
        lines.append("Sports: " + ", ".join(p.sports))
    lines.append(f"Availability: {p.days_per_week} days/week, {p.minutes_per_session} min per session")
    lines.append("Equipment: " + ", ".join(_EQUIPMENT[e] for e in p.equipment))
    if p.injuries:
        lines.append(f"Injuries or discomfort: {p.injuries}")
    if p.track_cycle:
        lines.append("Cycle: " + describe_cycle(p.cycle, p.age, today or date.today()))
    lines.append(f"Food budget: {_BUDGET[p.budget]}")
    if p.dietary_restrictions:
        lines.append(f"Dietary restrictions: {p.dietary_restrictions}")
    lines.append("Supplements already used: " + (", ".join(_SUPPLEMENTS[s] for s in p.supplements) or "none"))
    return "User profile:\n" + "\n".join(f"- {line}" for line in lines)


_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.nebius_api_key, base_url=settings.nebius_base_url)
    return _client


async def coach_reply(messages: list[dict[str, str]], profile: ProfileData | None = None) -> str:
    if settings.mock_mode:
        last = messages[-1]["content"] if messages else ""
        greeting = f"Hola, {profile.nickname}. " if profile else ""
        return (
            "🧪 Modo simulado (falta NEBIUS_API_KEY o COACH_MODEL en backend/.env). "
            f"{greeting}Recibí tu mensaje: «{last}». Cuando conectes Nemotron, aquí responderá el coach."
        )

    system = f"{COACH_SYSTEM_PROMPT}\n\nToday's date: {date.today().isoformat()}"
    if profile:
        system += "\n\n" + describe_profile(profile)
        if profile.track_cycle:
            system += "\n\n" + CYCLE_GUIDANCE

    response = await get_client().chat.completions.create(
        model=settings.coach_model,
        messages=[{"role": "system", "content": system}, *messages],
        temperature=0.6,
        max_tokens=800,
    )
    return response.choices[0].message.content or ""
