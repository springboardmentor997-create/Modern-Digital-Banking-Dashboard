from sqlalchemy.orm import Session
from app.models.bill import Bill
from app.bills.schemas import BillCreate, BillUpdate


class BillService:
    @staticmethod
    def create_bill(db: Session, user_id: int, payload: BillCreate):
        bill = Bill(
            user_id=user_id,
            biller_name=payload.biller_name,
            due_date=payload.due_date,
            amount_due=payload.amount_due,
            status=payload.status or "upcoming",
            auto_pay=payload.auto_pay or False,
        )
        db.add(bill)
        db.commit()
        db.refresh(bill)
        return bill

    @staticmethod
    def get_bills_for_user(db: Session, user_id: int):
        return db.query(Bill).filter(Bill.user_id == user_id).all()

    @staticmethod
    def get_all_bills(db: Session):
        return db.query(Bill).order_by(Bill.created_at.desc()).all()

    @staticmethod
    def get_bill(db: Session, bill_id: int, user_id: int):
        return db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == user_id).first()

    @staticmethod
    def get_bill_by_id(db: Session, bill_id: int):
        return db.query(Bill).filter(Bill.id == bill_id).first()

    @staticmethod
    def update_bill(db: Session, bill: Bill, payload: BillUpdate):
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(bill, k, v)
        db.add(bill)
        db.commit()
        db.refresh(bill)
        return bill

    @staticmethod
    def delete_bill(db: Session, bill: Bill):
        db.delete(bill)
        db.commit()


# small compatibility layer to match router imports
def create_bill(db: Session, user_id: int, payload: BillCreate):
    return BillService.create_bill(db, user_id, payload)

def get_bills_for_user(db: Session, user_id: int):
    return BillService.get_bills_for_user(db, user_id)

def get_user_bills(db: Session, user_id: int):
    return BillService.get_bills_for_user(db, user_id)

def get_bill(db: Session, bill_id: int, user_id: int):
    return BillService.get_bill(db, bill_id, user_id)

def get_bill_by_id(db: Session, bill_id: int):
    return BillService.get_bill_by_id(db, bill_id)

def update_bill(db: Session, bill: Bill, payload: BillUpdate):
    return BillService.update_bill(db, bill, payload)

def delete_bill(db: Session, bill: Bill):
    return BillService.delete_bill(db, bill)
