from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from datetime import date

from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.utils.hashing import Hash
from app.transfers.schemas import TransferCreate
from app.transactions.service import update_budget_on_transaction

def get_transfer_category(transfer_type: str):
    if transfer_type == "upi":
        return "Payments"
    if transfer_type == "bank":
        return "Transfers"
    if transfer_type == "self":
        return "Self Transfer"
    return "Others"


def send_money(
    db: Session,
    user: User,
    payload: TransferCreate
):
    # 1️⃣ Get sender account
    sender = db.query(Account).filter(
        Account.id == payload.from_account_id,
        Account.user_id == user.id
    ).first()

    if not sender:
        raise HTTPException(status_code=404, detail="Sender account not found")

    # 2️⃣ Verify PIN
    if not Hash.verify(sender.pin_hash, payload.pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    # 3️⃣ Check balance
    if sender.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # =========================
    # BANK TRANSFER
    # =========================
    if payload.transfer_type == "bank":
        if not payload.to_account_number:
            raise HTTPException(status_code=400, detail="Account number required")

        receiver = db.query(Account).filter(
            Account.masked_account.like(f"%{payload.to_account_number[-4:]}")
        ).first()

        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver account not found")

        sender.balance -= payload.amount
        receiver.balance += payload.amount

        debit_desc = "Bank transfer sent"
        credit_desc = "Bank transfer received"

    # =========================
    # SELF TRANSFER
    # =========================
    elif payload.transfer_type == "self":
        if not payload.to_account_id:
            raise HTTPException(status_code=400, detail="Target account required")

        receiver = db.query(Account).filter(
            Account.id == payload.to_account_id,
            Account.user_id == user.id
        ).first()

        if not receiver:
            raise HTTPException(status_code=404, detail="Target account not found")

        if receiver.id == sender.id:
            raise HTTPException(status_code=400, detail="Cannot transfer to same account")

        sender.balance -= payload.amount
        receiver.balance += payload.amount

        debit_desc = "Self transfer sent"
        credit_desc = "Self transfer received"

    # =========================
    # UPI TRANSFER (SIMULATED)
    # =========================
    elif payload.transfer_type == "upi":
        if not payload.upi_id:
            raise HTTPException(status_code=400, detail="UPI ID required")

        if "@" not in payload.upi_id and not payload.upi_id.isdigit():
            raise HTTPException(
                status_code=400,
                detail="Invalid UPI ID or Mobile Number"
            )
            raise HTTPException(status_code=400, detail="Invalid UPI ID")

        sender.balance -= payload.amount

        debit_desc = f"UPI payment to {payload.upi_id}"
        credit_desc = None  # External UPI (no internal credit)

    else:
        raise HTTPException(status_code=400, detail="Invalid transfer type")

    category = get_transfer_category(payload.transfer_type)

    # 4️⃣ Create debit transaction
    debit_txn = Transaction(
        user_id=user.id,
        account_id=sender.id,
        description=debit_desc,
        amount=payload.amount,
        txn_type=TransactionType.debit,
        category=category,
        txn_date=date.today(),
    )
    db.add(debit_txn)

    # 5️⃣ Create credit transaction (if internal)
    if payload.transfer_type in ["bank", "self"]:
        credit_txn = Transaction(
            user_id=receiver.user_id,
            account_id=receiver.id,
            description=credit_desc,
            amount=payload.amount,
            txn_type=TransactionType.credit,
            category=category,
            txn_date=date.today(),
        )
        db.add(credit_txn)



    update_budget_on_transaction(
        db=db,
        user_id=user.id,
        category=category,
        amount=payload.amount
    )



    db.commit()

    return {
        "status": "success",
        "message": "Transfer completed successfully"
    }