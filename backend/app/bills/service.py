from sqlalchemy.orm import Session
from app.models.bill import Bill
from app.bills.schemas import BillCreate, BillUpdate
from decimal import Decimal
from fastapi import HTTPException, status


class BillService:
    @staticmethod
    def create_bill(db: Session, user_id: int, payload: BillCreate, account_id: int = None):
        bill = Bill(
            user_id=user_id,
            account_id=account_id,
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
    def get_bill_safe(db: Session, bill_id: int):
        """Return a bill by id or raise 404 if not found."""
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        return bill

    @staticmethod
    def update_bill(db: Session, bill: Bill, payload: BillUpdate):
        # Exclude unset and None values so partial updates don't overwrite
        # existing fields with nulls when the client sends empty values.
        data = payload.dict(exclude_unset=True, exclude_none=True)

        previous_status = bill.status

        # If status is being changed to 'paid' and it wasn't 'paid' before,
        # attempt to deduct the bill amount from the provided account_id.
        will_mark_paid = data.get("status") == "paid"
        account_id = data.get("account_id")

        # Apply updates to bill fields first (but don't commit yet)
        for k, v in data.items():
            setattr(bill, k, v)

        # Auto-deduction + transaction creation: only when transitioning to paid for the first time
        if will_mark_paid and previous_status != "paid":
            # Prefer an account recorded on the bill if present, otherwise use the provided account_id
            acct_lookup_id = getattr(bill, "account_id", None) or account_id
            if acct_lookup_id is not None:
                # Create a transaction record for this bill payment so it appears in history
                try:
                    from datetime import datetime
                    from app.transactions.schemas import TransactionCreate
                    from app.transactions.service import TransactionService

                    amt = bill.amount_due if bill.amount_due is not None else Decimal("0")
                    # Ensure amt is a Decimal
                    if not isinstance(amt, Decimal):
                        amt = Decimal(str(amt))

                    tx_payload = TransactionCreate(
                        description=f"Bill payment: {getattr(bill, 'biller_name', None)}",
                        category="bills",
                        amount=amt,
                        currency="USD",
                        txn_type="debit",
                        merchant=getattr(bill, 'biller_name', None),
                        txn_date=datetime.utcnow()
                    )

                    # Delegate balance update + transaction insertion to TransactionService
                    TransactionService.create_transaction(db, acct_lookup_id, tx_payload)
                except Exception:
                    # If transaction creation fails, raise HTTPException to signal failure
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not record bill payment transaction")

        db.add(bill)
        # Commit once and refresh updated objects to keep transaction consistent
        db.commit()
        db.refresh(bill)
        if account_id is not None:
            try:
                from app.models.account import Account

                acct = db.query(Account).filter(Account.id == account_id).first()
                if acct:
                    db.refresh(acct)
            except Exception:
                # best-effort refresh; ignore refresh errors
                pass

        return bill

    @staticmethod
    def delete_bill(db: Session, bill: Bill):
        db.delete(bill)
        db.commit()


# small compatibility layer to match router imports
def create_bill(db: Session, user_id: int, payload: BillCreate, account_id: int = None):
    return BillService.create_bill(db, user_id, payload, account_id)

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


def get_all_bills(db: Session):
    return BillService.get_all_bills(db)
