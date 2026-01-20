from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.admin_dashboard import AdminDashboardSummary
from app.services.admin_dashboard import get_admin_dashboard_summary

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)


@router.get("/summary", response_model=AdminDashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return get_admin_dashboard_summary(db)
