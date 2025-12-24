from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.alerts.service import (
    create_budget_exceeded_alert,
    get_alerts_for_user,
)
from app.alerts.schemas import AlertOut

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("/test", response_model=AlertOut)
def test_alert(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    alert = create_budget_exceeded_alert(
        db=db,
        user_id=current_user.id,
        category="food",
        amount=500.0,
    )
    return alert


@router.get("/", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_alerts_for_user(db, current_user.id)
