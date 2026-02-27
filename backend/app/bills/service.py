from sqlalchemy.orm import Session
from app.models.bill import Bill
from app.bills.schemas import BillCreate, BillUpdate
from typing import List, Optional

class BillService:

    @staticmethod
    def create_bill(db: Session, bill_data: BillCreate, user_id: int) -> Bill:
        db_bill = Bill(
            user_id=user_id,
            name=bill_data.name,
            amount=bill_data.amount,
            due_date=bill_data.due_date,
            category=bill_data.category,
            description=bill_data.description,
            is_recurring=bill_data.is_recurring,
            recurring_frequency=bill_data.recurring_frequency,
            is_paid=bill_data.is_paid
        )
        db.add(db_bill)
        db.commit()
        db.refresh(db_bill)
        return db_bill

    @staticmethod
    def get_bills(db: Session, user_id: int) -> List[Bill]:
        return db.query(Bill).filter(Bill.user_id == user_id).order_by(Bill.due_date).all()

    @staticmethod
    def get_bill_by_id(db: Session, bill_id: int, user_id: int) -> Optional[Bill]:
        return db.query(Bill).filter(
            Bill.id == bill_id,
            Bill.user_id == user_id
        ).first()

    @staticmethod
    def update_bill(db: Session, bill_id: int, bill_data: BillUpdate, user_id: int) -> Optional[Bill]:
        bill = BillService.get_bill_by_id(db, bill_id, user_id)
        if not bill:
            return None

        for field, value in bill_data.dict(exclude_unset=True).items():
            setattr(bill, field, value)

        db.commit()
        db.refresh(bill)
        return bill

    @staticmethod
    def delete_bill(db: Session, bill_id: int, user_id: int) -> bool:
        bill = BillService.get_bill_by_id(db, bill_id, user_id)
        if not bill:
            return False

        db.delete(bill)
        db.commit()
        return True
