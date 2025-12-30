from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.bills.models import Bill
from app.bills.schemas import BillCreate 
from app.alerts.models import Alert, AlertType
from app.rewards.schemas import RewardCreate
from app.rewards.service import create_reward



def create_bill(
    db: Session,
    user_id: int,
    bill_in: BillCreate,
):
    bill = Bill(
        user_id=user_id,
        name=bill_in.name,
        amount=bill_in.amount,
        due_date=bill_in.due_date,
        frequency=bill_in.frequency,
        is_paid=False,
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    return bill


def get_user_bills(
    db: Session,
    user_id: int,
):
    return (
        db.query(Bill)
        .filter(Bill.user_id == user_id)
        .order_by(Bill.due_date.asc())
        .all()
    )


def get_upcoming_bills(
    db: Session,
    user_id: int,
    today: date,
):
    return (
        db.query(Bill)
        .filter(
            Bill.user_id == user_id,
            Bill.is_paid == False,
            Bill.due_date >= today,
        )
        .order_by(Bill.due_date.asc())
        .all()
    )


def mark_bill_as_paid(db, bill):
    if bill.is_paid:
        return bill

    bill.is_paid = True
    bill.paid_at = date.today()

    db.commit()
    db.refresh(bill)

    # 🎁 Auto reward: on-time payment
    if bill.paid_at <= bill.due_date:
        reward_in = RewardCreate(
            user_id=bill.user_id,
            title="On-time Bill Payment",
            reason=f"Paid bill '{bill.name}' before due date",
            points=20,
        )
        create_reward(db, reward_in)

    return bill


def generate_bill_due_alerts(db: Session, user_id: int):
    today = date.today()
    due_limit = today + timedelta(days=3)

    bills = (
        db.query(Bill)
        .filter(
            Bill.user_id == user_id,
            Bill.is_paid == False,
            Bill.due_date >= today,
            Bill.due_date <= due_limit,
        )
        .all()
    )

    created_alerts = []

    for bill in bills:
        alert = Alert(
            user_id=user_id,
            type=AlertType.bill_due,
            message=f"Bill '{bill.name}' is due on {bill.due_date}",
        )
        db.add(alert)
        created_alerts.append(alert)

    if created_alerts:
        db.commit()

    return created_alerts

