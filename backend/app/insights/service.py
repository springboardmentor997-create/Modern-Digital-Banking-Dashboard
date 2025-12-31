from sqlalchemy.orm import Session

from app.transactions.service import (
    get_monthly_spending_trend,
)
from app.dashboard.service import get_monthly_spending

from datetime import datetime
from sqlalchemy import func, extract

from app.transactions.models import Transaction, TransactionType
from app.insights.schemas import CashFlowOut

from app.insights.schemas import TopMerchantsOut, TopMerchantItem


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


def get_top_merchants(
    db: Session,
    user_id: int,
    limit: int = 5,
) -> TopMerchantsOut:
    now = datetime.utcnow()

    rows = (
        db.query(
            Transaction.description.label("merchant"),
            func.sum(Transaction.amount).label("total_spent"),
        )
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == now.year)
        .filter(extract("month", Transaction.transaction_date) == now.month)
        .group_by(Transaction.description)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
        .all()
    )

    merchants = [
        TopMerchantItem(
            merchant=row[0] or "Unknown",
            total_spent=float(row[1]),
        )
        for row in rows
    ]

    return TopMerchantsOut(
        month=now.strftime("%Y-%m"),
        top_merchants=merchants,
    )


def get_burn_rate(db: Session, user_id: int):
    now = datetime.utcnow()

    # Total spent this month
    total_spent = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == now.year)
        .filter(extract("month", Transaction.transaction_date) == now.month)
        .scalar()
    )

    day_of_month = now.day
    days_in_month = 31 

    daily_burn_rate = float(total_spent) / day_of_month if day_of_month > 0 else 0
    projected_monthly_spend = daily_burn_rate * days_in_month

    return {
        "month": now.strftime("%Y-%m"),
        "days_elapsed": day_of_month,
        "total_spent": float(total_spent),
        "daily_burn_rate": round(daily_burn_rate, 2),
        "projected_monthly_spend": round(projected_monthly_spend, 2),
    }
