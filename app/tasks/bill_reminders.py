"""
Bill Reminder Tasks

What:
- Checks upcoming bills
- Creates reminder alerts for users

How:
- Triggered via API or scheduler
- Uses DB alerts (no email/SMS yet)

Why:
- Keeps reminder logic server-side
- Can later be extended to Celery / cron
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.bill import Bill
from app.models.alert import Alert


def run_bill_reminders(db: Session):
    """
    Create reminders for bills due in next 2 days
    """

    today = date.today()
    reminder_date = today + timedelta(days=2)

    bills = db.query(Bill).filter(
        Bill.due_date <= reminder_date,
        Bill.status == "upcoming"
    ).all()

    for bill in bills:
        # Avoid duplicate alerts
        existing = db.query(Alert).filter(
            Alert.user_id == bill.user_id,
            Alert.type == "bill_due",
            Alert.message.contains(bill.biller_name)
        ).first()

        if existing:
            continue

        alert = Alert(
            user_id=bill.user_id,
            type="bill_due",
            message=f"Bill '{bill.biller_name}' is due on {bill.due_date}"
        )

        db.add(alert)

    db.commit()
