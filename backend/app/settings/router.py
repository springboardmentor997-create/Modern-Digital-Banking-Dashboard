from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_settings import UserSettings
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["Settings"])


# ---------------- SCHEMA ----------------
class SettingsUpdate(BaseModel):
    push_notifications: bool | None = None
    email_alerts: bool | None = None
    login_alerts: bool | None = None
    two_factor_enabled: bool | None = None


# ---------------- GET SETTINGS ----------------
@router.get("")
def get_settings(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    settings = db.query(UserSettings).filter_by(user_id=user.id).first()

    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


# ---------------- UPDATE SETTINGS ----------------
@router.put("")
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    settings = db.query(UserSettings).filter_by(user_id=user.id).first()

    if not settings:
        return {"error": "Settings not found"}

    for key, value in data.dict(exclude_unset=True).items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings
