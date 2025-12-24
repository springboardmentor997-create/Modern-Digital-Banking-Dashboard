from sqlalchemy.orm import Session

from app.alerts.models import Alerts, AlertType
from app.budgets.models import Budget


def create_budget_exceeded_alert(
    db: Session,
    user_id: int,
    budget: Budget,
):
    """
    Create a budget_exceeded alert for a user
    Only one alert per budget category is allowed
    """

    existing_alert = (
        db.query(Alerts)
        .filter(
            Alerts.user_id == user_id,
            Alerts.type == AlertType.budget_exceeded,
            Alerts.message.contains(budget.category),
        )
        .first()
    )

    if existing_alert:
        return None

    alert = Alerts(
        user_id=user_id,
        type=AlertType.budget_exceeded,
        message=f"Budget exceeded for {budget.category} ({budget.period.value})",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert
