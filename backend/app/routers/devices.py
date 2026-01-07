from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_device import UserDevice

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.post("/register")
def register_device(
    payload: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    token = payload.get("device_token")
    platform = payload.get("platform")

    if not token:
        return {"error": "Device token required"}

    existing = db.query(UserDevice).filter_by(device_token=token).first()
    if existing:
        return {"message": "Device already registered"}

    device = UserDevice(
        user_id=user.id,
        device_token=token,
        platform=platform
    )

    db.add(device)
    db.commit()
    return {"message": "Device registered successfully"}
