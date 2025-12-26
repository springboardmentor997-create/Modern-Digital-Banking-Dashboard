from fastapi import APIRouter, Depends

from app.database import get_db
from app.dependencies import get_current_user
from app.dashboard.service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard_summary(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_dashboard_summary(db=db, user_id=current_user.id)
