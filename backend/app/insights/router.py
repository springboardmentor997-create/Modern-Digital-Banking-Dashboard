from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from sqlalchemy import func, case
from app.models.transaction import Transaction
from app.models.account import Account

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.insights import service
from app.insights.schemas import (
    InsightsSummary,
    MonthlySpendingItem,
    CategoryBreakdownItem,
)

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/summary", response_model=InsightsSummary)
def insights_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_insights_summary(db, current_user.id)


@router.get("/monthly", response_model=list[MonthlySpendingItem])
def monthly_spending(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_monthly_spending(db, current_user.id, month, year)


@router.get("/categories", response_model=list[CategoryBreakdownItem])
def category_breakdown(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_category_breakdown(db, current_user.id, month, year)



@router.get("/dashboard/daily")
def dashboard_daily_insights(
    days: int = 15,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_date = datetime.utcnow() - timedelta(days=days)

    rows = (
        db.query(
            func.date(Transaction.txn_date).label("date"),
            func.sum(
                case(
                    (Transaction.txn_type == "credit", Transaction.amount),
                    else_=0
                )
            ).label("income"),
            func.sum(
                case(
                    (Transaction.txn_type == "debit", Transaction.amount),
                    else_=0
                )
            ).label("expense"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(
            Account.user_id == current_user.id,
            Transaction.txn_date >= start_date,
        )
        .group_by(func.date(Transaction.txn_date))
        .order_by(func.date(Transaction.txn_date))
        .all()
    )

    today = date.today()

    days_list = [
        today - timedelta(days=i)
        for i in reversed(range(days))
    ]

    data_map = {
        r.date: {
            "income": float(r.income or 0),
            "expense": float(r.expense or 0),
        }
        for r in rows
    }

    result = []
    for d in days_list:
        entry = data_map.get(d, {"income": 0, "expense": 0})
        result.append({
            "date": d.isoformat(),
            "income": entry["income"],
            "expense": entry["expense"],
        })

    return result

    