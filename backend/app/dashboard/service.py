from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.accounts.models import Account
from app.alerts.models import Alert
from app.transactions.models import Transaction, TransactionType
from app.transactions.service import get_monthly_total_spent
from app.budgets.service import get_budget_vs_actual


# -------------------------
# Account summary
# -------------------------
def get_account_summary(db: Session, user_id: int):
    result = (
        db.query(
            func.count(Account.id),
            func.coalesce(func.sum(Account.balance), 0),
        )
        .filter(Account.user_id == user_id)
        .first()
    )

    return {
        "total_accounts": result[0],
        "total_balance": float(result[1]),
    }


# -------------------------
# Monthly spending
# -------------------------
def get_monthly_spending(db: Session, user_id: int):
    now = datetime.utcnow()

    total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == now.year)
        .filter(extract("month", Transaction.transaction_date) == now.month)
        .scalar()
    )

    return {
        "month": now.strftime("%Y-%m"),
        "total_spent": float(total),
    }


# -------------------------
# Budget summary
# -------------------------
def get_dashboard_budget_summary(db: Session, user_id: int):
    return get_budget_vs_actual(db=db, user_id=user_id)


# -------------------------
# Alerts count
# -------------------------
def get_alerts_count(db: Session, user_id: int):
    return (
        db.query(Alert)
        .filter(Alert.user_id == user_id)
        .count()
    )


# -------------------------
# FULL DASHBOARD OVERVIEW
# -------------------------
def get_dashboard_overview(db: Session, user_id: int):
    accounts = get_account_summary(db, user_id)
    spending = get_monthly_spending(db, user_id)
    budgets = get_dashboard_budget_summary(db, user_id)
    alerts_count = get_alerts_count(db, user_id)

    return {
        "accounts": accounts,
        "monthly_spending": spending,
        "budgets": budgets,
        "alerts_count": alerts_count,
    }
