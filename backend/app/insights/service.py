from sqlalchemy.orm import Session

from app.transactions.service import (
    get_monthly_spending_trend,
)
from app.dashboard.service import get_monthly_spending

from datetime import datetime
from sqlalchemy import func, extract

from app.transactions.models import Transaction, TransactionType
from app.insights.schemas import CashFlowOut

def get_spending_insights(db: Session, user_id: int):
    monthly = get_monthly_spending(db, user_id)
    trend = get_monthly_spending_trend(db, user_id)

    return {
        "monthly_spending": monthly,
        "trend": trend,
    }


def get_cash_flow(db: Session, user_id: int) -> CashFlowOut:
    now = datetime.utcnow()
    year = now.year
    month = now.month

    income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.income)
        .filter(extract("year", Transaction.transaction_date) == year)
        .filter(extract("month", Transaction.transaction_date) == month)
        .scalar()
    )

    expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == year)
        .filter(extract("month", Transaction.transaction_date) == month)
        .scalar()
    )

    net = float(income) - float(expense)

    if net > 0:
        status = "positive"
    elif net < 0:
        status = "negative"
    else:
        status = "neutral"

    return CashFlowOut(
        month=now.strftime("%Y-%m"),
        income=float(income),
        expense=float(expense),
        net_cash_flow=net,
        status=status,
    )
