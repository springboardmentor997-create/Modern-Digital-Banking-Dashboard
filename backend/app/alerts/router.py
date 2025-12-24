from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.alerts.models import Alerts
from app.alerts.schemas import AlertOut

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/", response_model=list[AlertOut])
def list_user_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    alerts = (
        db.query(Alerts)
        .filter(Alerts.user_id == current_user.id)
        .order_by(Alerts.created_at.desc())
        .all()
    )

    return alerts
