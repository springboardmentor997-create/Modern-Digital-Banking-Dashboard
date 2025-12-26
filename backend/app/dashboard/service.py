from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.accounts.models import Account
from app.alerts.models import Alert
from app.transactions.service import get_monthly_total_spent
from app.budgets.service import get_budget_vs_actual

def get_dashboard_summary(db: Session, user_id: int):
    """
    Aggregated dashboard data for a user
    """

    # 1️⃣ Total balance (all accounts)
    total_balance = (
        db.query(func.coalesce(func.sum(Account.balance), 0))
        .filter(Account.user_id == user_id)
        .scalar()
    )

    # 2️⃣ Monthly spent
    now = datetime.utcnow()
    monthly_spent = get_monthly_total_spent(
        db=db,
        user_id=user_id,
        year=now.year,
        month=now.month,
    )

    # 3️⃣ Budget summaries
    budgets = get_budget_vs_actual(db=db, user_id=user_id)

    # 4️⃣ Alerts count
    alerts_count = (
        db.query(Alert)
        .filter(Alert.user_id == user_id)
        .count()
    )

    return {
        "total_balance": float(total_balance),
        "monthly_spent": float(monthly_spent),
        "budgets": budgets,
        "alerts_count": alerts_count,
    }


def get_account_summary(db: Session, user_id: int):
    result = (
        db.query(
            func.count(Account.id),
            func.coalesce(func.sum(Account.balance), 0)
        )
        .filter(Account.user_id == user_id)
        .first()
    )

    return {
        "total_accounts": result[0],
        "total_balance": float(result[1]),
    }
