from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.admin_analytics import (
    AdminAnalyticsSummary,
    TopUserAnalytics
)
from app.services.admin_analytics import (
    get_admin_analytics_summary,
    get_top_users_by_activity
)

router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin Analytics"]
)


@router.get("/summary", response_model=AdminAnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db)):
    return get_admin_analytics_summary(db)


@router.get("/top-users", response_model=List[TopUserAnalytics])
def analytics_top_users(db: Session = Depends(get_db)):
    return get_top_users_by_activity(db)
