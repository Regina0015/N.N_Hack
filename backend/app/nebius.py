"""Thin wrapper around Nebius Token Factory (OpenAI-compatible API)."""
from openai import AsyncOpenAI

from app.config import settings

COACH_SYSTEM_PROMPT = (
    "You are a warm, encouraging personal wellness coach. "
    "You build gym routines that respect the user's sports, equipment, injuries and energy level. "
    "Low-energy days are fine: suggest lighter alternatives without guilt. "
    "Never recommend extreme diets, and remind users you are not a substitute for a doctor "
    "or nutritionist when giving health advice. Reply in the user's language."
)

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
