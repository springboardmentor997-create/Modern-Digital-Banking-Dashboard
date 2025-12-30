from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.insights.service import get_spending_insights

router = APIRouter(
    prefix="/insights",
    tags=["Insights"],
)


@router.get("/spending")
def spending_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_spending_insights(db, current_user.id)
