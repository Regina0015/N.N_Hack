from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import coach

app = FastAPI(title="AI Wellness Coach API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(coach.router)


@app.get("/health")
async def health() -> dict[str, object]:
    return {"status": "ok", "mock_mode": settings.mock_mode}
