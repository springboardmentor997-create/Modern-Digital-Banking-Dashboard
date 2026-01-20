from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.alert import Alert
from app.models.user import User

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

# -----------------------------
# GET ALL USER ALERTS
# -----------------------------
@router.get("/")
def get_user_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )

# -----------------------------
# GET UNREAD ALERT COUNT (BELL)
# -----------------------------
@router.get("/notifications")
def get_unread_alert_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "count": db.query(Alert)
        .filter(
            Alert.user_id == current_user.id,
            Alert.is_read == False
        )
        .count()
    }

# -----------------------------
# MARK ALL ALERTS AS READ
# -----------------------------
@router.post("/mark-read")
def mark_alerts_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False
    ).update({"is_read": True})

    db.commit()
    return {"message": "Alerts marked as read"}
