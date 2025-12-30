from sqlalchemy.orm import Session

from app.transactions.service import (
    get_monthly_spending_trend,
)
from app.dashboard.service import get_monthly_spending


def get_spending_insights(db: Session, user_id: int):
    monthly = get_monthly_spending(db, user_id)
    trend = get_monthly_spending_trend(db, user_id)

    return {
        "monthly_spending": monthly,
        "trend": trend,
    }
