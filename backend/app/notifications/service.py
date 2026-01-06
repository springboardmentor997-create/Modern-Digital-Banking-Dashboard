from sqlalchemy.orm import Session
from app.notifications.models import Notification
from datetime import datetime


class NotificationService:
    @staticmethod
    def get_notifications_for_user(db: Session, user_id: int):
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def create_notification(db: Session, user_id: int, type_: str, title: str, message: str, scheduled_date: datetime = None):
        n = Notification(
            user_id=user_id,
            type=type_,
            title=title,
            message=message,
            scheduled_date=scheduled_date,
            sent=False,
        )
        db.add(n)
        db.commit()
        db.refresh(n)
        return n

    @staticmethod
    def mark_sent(db: Session, notification: Notification):
        notification.sent = True
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification


# Compatibility wrappers
def get_notifications_for_user(db: Session, user_id: int):
    return NotificationService.get_notifications_for_user(db, user_id)

def create_notification(db: Session, user_id: int, type_: str, title: str, message: str, scheduled_date: datetime = None):
    return NotificationService.create_notification(db, user_id, type_, title, message, scheduled_date)
