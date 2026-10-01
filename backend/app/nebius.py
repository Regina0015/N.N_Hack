"""Thin wrapper around Nebius Token Factory (OpenAI-compatible API)."""
from openai import AsyncOpenAI

from app.config import settings

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

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.nebius_api_key, base_url=settings.nebius_base_url)
    return _client


async def coach_reply(messages: list[dict[str, str]]) -> str:
    if settings.mock_mode:
        last = messages[-1]["content"] if messages else ""
        return (
            "🧪 Modo simulado (falta NEBIUS_API_KEY o COACH_MODEL en backend/.env). "
            f"Recibí tu mensaje: «{last}». Cuando conectes Nemotron, aquí responderá el coach."
        )

    response = await get_client().chat.completions.create(
        model=settings.coach_model,
        messages=[{"role": "system", "content": COACH_SYSTEM_PROMPT}, *messages],
        temperature=0.6,
        max_tokens=800,
    )
    return response.choices[0].message.content or ""
