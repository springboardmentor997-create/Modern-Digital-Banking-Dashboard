import threading
import time
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.notifications.models import Notification
from app.notifications.service import create_notification
from app.models.bill import Bill


def run_checks_once():
    db = SessionLocal()
    try:
        now = datetime.utcnow()

        # Bill reminders: create notification for bills due in next 3 days
        window_end = now.date() + timedelta(days=3)
        bills = db.query(Bill).filter(Bill.status != 'paid', Bill.due_date <= window_end).all()
        for b in bills:
            # simple dedupe: check if notification with same title exists
            title = f"Upcoming bill: {b.biller_name}"
            exists = db.query(Notification).filter(Notification.user_id == b.user_id, Notification.title == title, Notification.scheduled_date == datetime.combine(b.due_date, datetime.min.time())).first()
            if not exists:
                message = f"Your bill '{b.biller_name}' of amount {b.amount_due} is due on {b.due_date}."
                create_notification(db, b.user_id, 'bill_reminder', title, message, scheduled_date=datetime.combine(b.due_date, datetime.min.time()))
    finally:
        db.close()


def _scheduler_loop(interval_seconds: int = 24 * 3600):
    while True:
        try:
            run_checks_once()
        except Exception:
            # swallow scheduler exceptions to keep loop running
            pass
        time.sleep(interval_seconds)


def start_scheduler(interval_seconds: int = 24 * 3600):
    t = threading.Thread(target=_scheduler_loop, args=(interval_seconds,), daemon=True)
    t.start()
