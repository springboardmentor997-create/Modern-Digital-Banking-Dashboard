from sqlalchemy.orm import Session
from datetime import date

from app.alerts.models import Alert
from app.alerts.schemas import AlertType
from app.budgets.models import Budget


def create_budget_exceeded_alert(
    db: Session,
    user_id: int,
    budget: Budget,
):
    # Prevent duplicate alerts for same budget + period
    existing = (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.type == AlertType.budget_exceeded,
            Alert.message.contains(budget.category),
        )
        .first()
    )

    if existing:
        return None

    alert = Alert(
        user_id=user_id,
        type=AlertType.budget_exceeded,
        message=f"Budget exceeded for {budget.category} ({budget.period.value})",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
