from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.alerts.models import Alert
from app.alerts.schemas import AlertOut

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("/test", response_model=AlertOut)
def create_test_alert(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alert = Alert(
        user_id=current_user.id,
        type="test_alert",
        message="This is a test alert"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/", response_model=list[AlertOut])
def get_user_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )
