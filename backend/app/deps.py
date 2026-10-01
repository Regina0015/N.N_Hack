"""Request-scoped dependencies shared by routers."""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db import Profile, get_session
from app.schemas import ProfileData

LOCAL_USER_ID = "local-user"


def get_current_user_id() -> str:
    """Single local user until Supabase Auth is wired in — required before any public deploy."""
    return LOCAL_USER_ID


def get_current_profile(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> ProfileData | None:
    row = session.get(Profile, user_id)
    return ProfileData.model_validate(row.data) if row else None
