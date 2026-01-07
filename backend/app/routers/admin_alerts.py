from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.admin_alerts import (
    fetch_admin_alerts,
    fetch_admin_logs
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin Alerts & Logs"]
)


@router.get("/alerts")
def get_alerts(
    type: str | None = None,
    db: Session = Depends(get_db)
):
    return fetch_admin_alerts(db, type)


@router.get("/logs")
def get_logs(
    action: str | None = None,
    db: Session = Depends(get_db)
):
    return fetch_admin_logs(db, action)
