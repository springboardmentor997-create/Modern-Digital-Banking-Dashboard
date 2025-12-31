from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.insights.service import get_spending_insights

from app.insights.service import get_cash_flow

from app.insights.service import get_top_merchants

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


@router.get("/cash-flow")
def cash_flow(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return get_cash_flow(db, user.id)


@router.get("/top-merchants")
def top_merchants(
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    return get_top_merchants(db, user.id)
