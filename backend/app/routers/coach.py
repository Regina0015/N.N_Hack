from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.nebius import coach_reply

router = APIRouter(prefix="/api/coach", tags=["coach"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=40)


class ChatResponse(BaseModel):
    reply: str
    mock: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        reply = await coach_reply([m.model_dump() for m in request.messages])
    except Exception as exc:  # surface provider errors without leaking secrets
        raise HTTPException(status_code=502, detail=f"Model provider error: {type(exc).__name__}") from exc
    return ChatResponse(reply=reply, mock=settings.mock_mode)
