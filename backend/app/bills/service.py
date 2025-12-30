from sqlalchemy.orm import Session
from datetime import date

from app.bills.models import Bill
from app.bills.schemas import BillCreate


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


def mark_bill_as_paid(
    db: Session,
    bill_id: int,
    user_id: int,
):
    bill = (
        db.query(Bill)
        .filter(
            Bill.id == bill_id,
            Bill.user_id == user_id,
        )
        .first()
    )

    if not bill:
        raise ValueError("Bill not found")

    bill.is_paid = True
    db.commit()
    db.refresh(bill)

    return bill
