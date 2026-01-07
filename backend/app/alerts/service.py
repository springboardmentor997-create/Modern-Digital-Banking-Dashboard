from sqlalchemy.orm import Session
from app.models.alert import Alert

def create_alert(db: Session, user_id: int, alert_type: str, message: str):
    """
    Creates an alert entry for the user.

    Used for:
    - Login alerts
    - Money received notifications
    - Security events
    """
    alert = Alert(
        user_id=user_id,
        type=alert_type,
        message=message
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
