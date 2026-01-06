from sqlalchemy.orm import Session
from app.notifications.models import Notification
from app.notifications.schemas import NotificationCreate
from datetime import datetime


def create_notification(db: Session, notification: NotificationCreate, user_id: int) -> Notification:
    n = Notification(
        user_id=user_id,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        scheduled_date=notification.scheduled_date,
        sent=False,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
