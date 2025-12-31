from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.insights.service import get_spending_insights

from app.insights.service import get_cash_flow

from app.insights.service import get_top_merchants

from fastapi import APIRouter, Depends, HTTPException

from app.insights.service import (
    get_financial_health_score,
)


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


@router.get("/health-score")
def financial_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Financial health score
    - User: own score
    - Auditor/Support: read-only allowed
    - Admin: allowed
    """

    if current_user.role not in {
        UserRole.user,
        UserRole.admin,
        UserRole.auditor,
        UserRole.support,
    }:
        raise HTTPException(status_code=403, detail="Access denied")

    return get_financial_health_score(db, current_user.id)
