from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, StringConstraints
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import settings
from app.db import Message, get_session
from app.deps import get_current_profile, get_current_user_id
from app.nebius import coach_reply
from app.schemas import ProfileData

router = APIRouter(prefix="/api/coach", tags=["coach"])

# Turns sent to the model per request (prompt cost); the UI can show more via HISTORY_MESSAGES.
CONTEXT_MESSAGES = 20
HISTORY_MESSAGES = 100


class ChatRequest(BaseModel):
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class ChatResponse(BaseModel):
    reply: str
    mock: bool


class StoredMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class HistoryResponse(BaseModel):
    messages: list[StoredMessage]


def _recent(session: Session, user_id: str, limit: int) -> list[Message]:
    rows = session.scalars(
        select(Message).where(Message.user_id == user_id).order_by(Message.id.desc()).limit(limit)
    ).all()
    return list(reversed(rows))


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    profile: ProfileData | None = Depends(get_current_profile),
    session: Session = Depends(get_session),
) -> ChatResponse:
    earlier = _recent(session, user_id, CONTEXT_MESSAGES - 1)
    messages = [{"role": m.role, "content": m.content} for m in earlier]
    messages.append({"role": "user", "content": request.message})
    try:
        reply = await coach_reply(messages, profile)
    except Exception as exc:  # surface provider errors without leaking secrets
        raise HTTPException(status_code=502, detail=f"Model provider error: {type(exc).__name__}") from exc

    # Saved only after a successful reply, so a failed turn can simply be retried.
    session.add_all([
        Message(user_id=user_id, role="user", content=request.message),
        Message(user_id=user_id, role="assistant", content=reply),
    ])
    session.commit()
    return ChatResponse(reply=reply, mock=settings.mock_mode)


@router.get("/history", response_model=HistoryResponse)
def read_history(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> HistoryResponse:
    rows = _recent(session, user_id, HISTORY_MESSAGES)
    return HistoryResponse(messages=[StoredMessage.model_validate(r, from_attributes=True) for r in rows])


@router.delete("/history", status_code=204)
def clear_history(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> Response:
    session.execute(delete(Message).where(Message.user_id == user_id))
    session.commit()
    return Response(status_code=204)
