"""
Bills Service

What:
- Handles bill & recharge payments
- Reuses existing transaction engine
- Applies bill categories
- Performs strict validation
"""

from sqlalchemy.orm import Session
from datetime import date
from fastapi import HTTPException

from app.transactions.service import create_transaction
from app.transactions.schemas import TransactionCreate
from app.models.transaction import TransactionType
from app.models.account import Account
from app.utils.hashing import Hash
from app.bills.categories import BILL_CATEGORIES
from app.rewards.service import add_reward_points
from app.models.bill import Bill
from app.bills.schemas import BillCreate, BillUpdate



def pay_bill(db: Session, current_user, data):
    # --------------------------------
    # Validate bill type
    # --------------------------------
    if data.bill_type not in BILL_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Invalid bill type"
        )

    bill_meta = BILL_CATEGORIES[data.bill_type]

    # --------------------------------
    # Validate account ownership
    # --------------------------------
    account = db.query(Account).filter(
        Account.id == data.account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # --------------------------------
    # Validate PIN
    # --------------------------------
    if not Hash.verify(account.pin_hash, data.pin):
        raise HTTPException(
            status_code=400,
            detail="Invalid PIN"
        )

    # --------------------------------
    # Validate balance
    # --------------------------------
    if account.balance < data.amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    # --------------------------------
    # Build transaction description
    # (REAL-WORLD AUDIT FRIENDLY)
    # --------------------------------
    description = bill_meta["description"]

    if data.provider:
        description += f" | Provider: {data.provider}"

    description += f" | Ref: {data.reference_id}"

    # --------------------------------
    # Create transaction payload
    # --------------------------------
    txn_data = TransactionCreate(
        account_id=data.account_id,
        amount=data.amount,
        txn_type=TransactionType.debit,
        description=description,
        txn_date=date.today(),
        category=bill_meta["category"]
    )


    # --------------------------------
    # Create transaction
    # --------------------------------
    transaction = create_transaction(db, current_user.id, txn_data)

    if not transaction:
        raise HTTPException(
            status_code=500,
            detail="Transaction failed"
        )
    
    # --------------------------------
    # Add reward points for bill payment
    # --------------------------------
    add_reward_points(
        db=db,
        user_id=current_user.id,
        program_name=f"{data.bill_type.title()} Rewards",
        points=5
    )

    
    # --------------------------------
    # Mark bill as paid (if bill_id provided)
    # --------------------------------
    if data.bill_id:
        bill = db.query(Bill).filter(
            Bill.id == data.bill_id,
            Bill.user_id == current_user.id
        ).first()
        
        if bill:
            bill.status = "paid"
            db.commit()

    return transaction


def create_bill(db: Session, user_id: int, data: BillCreate):
    bill = Bill(
        user_id=user_id,
        biller_name=data.biller_name,
        due_date=data.due_date,
        amount_due=data.amount_due,
        account_id=data.account_id,
        auto_pay=data.auto_pay
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


def get_user_bills(db: Session, user_id: int):
    return db.query(Bill).filter(Bill.user_id == user_id).all()


def update_bill(db: Session, bill_id: int, user_id: int, data: BillUpdate):
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == user_id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(bill, key, value)

    db.commit()
    db.refresh(bill)
    return bill


def delete_bill(db: Session, bill_id: int, user_id: int):
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == user_id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()
