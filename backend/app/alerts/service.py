from sqlalchemy.orm import Session

from app.alerts.models import Alert, AlertType


def create_budget_exceeded_alert(
    db: Session,
    user_id: int,
    category: str,
    amount: float,
):
    alert = Alert(
        user_id=user_id,
        type=AlertType.budget_exceeded,
        message=f"Budget exceeded for category '{category}'. Exceeded amount: {amount}",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def get_alerts_for_user(db: Session, user_id: int):
    return (
        db.query(Alert)
        .filter(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc())
        .all()
    )


def get_all_alerts(db: Session):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()


