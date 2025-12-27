from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.dashboard.service import get_monthly_spending

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Dashboard API working",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@router.get("/monthly-spending")
def monthly_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_spending(db, current_user.id)
