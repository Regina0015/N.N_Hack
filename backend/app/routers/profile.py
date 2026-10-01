from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import Profile, get_session
from app.deps import get_current_profile, get_current_user_id
from app.schemas import ProfileData

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileData)
def read_profile(profile: ProfileData | None = Depends(get_current_profile)) -> ProfileData:
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("", response_model=ProfileData)
def save_profile(
    profile: ProfileData,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> ProfileData:
    data = profile.model_dump(mode="json")
    row = session.get(Profile, user_id)
    if row is None:
        session.add(Profile(user_id=user_id, data=data))
    else:
        row.data = data
    session.commit()
    return profile
