from sqlalchemy.orm import Session
from decimal import Decimal

from app.transactions.models import Transaction, TransactionType
from app.transactions.schemas import TransactionCreate
from app.accounts.models import Account


def create_transaction(
    db: Session,
    user_id: int,
    tx_in: TransactionCreate,
):
    # 1️⃣ Fetch account and enforce ownership
    account = (
        db.query(Account)
        .filter(
            Account.id == tx_in.account_id,
            Account.user_id == user_id
        )
        .first()
    )

    if not account:
        raise ValueError("Account not found or access denied")

    # 2️⃣ Calculate new balance
    new_balance = account.balance

    if tx_in.transaction_type == TransactionType.income:
        new_balance += tx_in.amount

    elif tx_in.transaction_type == TransactionType.expense:
        if account.balance < tx_in.amount:
            raise ValueError("Insufficient balance")
        new_balance -= tx_in.amount

    elif tx_in.transaction_type == TransactionType.transfer:
        # Placeholder: handled later (Phase 2)
        raise ValueError("Transfer transactions not supported yet")

    # 3️⃣ Create transaction record
    transaction = Transaction(
        user_id=user_id,
        account_id=tx_in.account_id,
        amount=tx_in.amount,
        transaction_type=tx_in.transaction_type,
        category=tx_in.category,
        description=tx_in.description,
        transaction_date=tx_in.transaction_date,
    )

    # 4️⃣ Persist changes atomically
    account.balance = new_balance
    db.add(transaction)
    db.flush()
    db.refresh(transaction)

    return transaction


def get_account_transactions(
    db: Session,
    user_id: int,
    account_id: int,
):
    return (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.account_id == account_id,
        )
        .order_by(Transaction.transaction_date.desc())
        .all()
    )


def get_user_transactions(db: Session, user_id: int):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

