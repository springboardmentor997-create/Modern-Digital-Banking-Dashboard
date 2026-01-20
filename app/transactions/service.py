"""
Transaction Service

What:
- Core transaction logic
- Validates account
- Enforces budget limits
- Creates transaction record
- Updates account balance
- Updates budget spent amount

Backend Connections:
- Called by transactions.router
- Uses Account, Transaction, Budget models
"""

from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from fastapi import HTTPException

from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.budgets.models import Budget
from app.transactions.schemas import TransactionCreate
from app.models.user_settings import UserSettings
from app.alerts.service import create_alert
from app.alerts.utils import notify_transaction
from app.utils.email_utils import send_email
from app.models.user_device import UserDevice
from app.firebase.firebase import send_push_notification


def create_transaction(
    db: Session,
    user_id: int,
    data: TransactionCreate
):
    # -------------------------------
    # Validate account ownership
    # -------------------------------
    account = db.query(Account).filter(
        Account.id == data.account_id,
        Account.user_id == user_id
    ).first()

    if not account:
        return None

    # -------------------------------
    # Detect category
    # -------------------------------
    category = detect_transaction_category(data.description)

    # -------------------------------
    # CHECK BUDGET LIMIT (ONLY FOR DEBIT)
    # -------------------------------
    if data.txn_type == TransactionType.debit:
        now = datetime.utcnow()

        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category == category,
            Budget.month == now.month,
            Budget.year == now.year,
            Budget.is_active == True
        ).first()

        if budget:
            if budget.spent_amount + data.amount > budget.limit_amount:
                raise HTTPException(
                    status_code=400,
                    detail="Budget limit exceeded for this category"
                )

    # -------------------------------
    # CREATE TRANSACTION
    # -------------------------------
    transaction = Transaction(
        user_id=user_id,
        account_id=data.account_id,
        amount=data.amount,
        txn_type=data.txn_type,
        category=category,
        description=data.description,
        txn_date = data.txn_date or datetime.now(timezone.utc).date()
    )

    # -------------------------------
    # UPDATE ACCOUNT BALANCE
    # -------------------------------
    if data.txn_type == TransactionType.debit:
        account.balance -= data.amount
    else:
        account.balance += data.amount

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # -------------------------------
    # UPDATE BUDGET SPENT AMOUNT
    # -------------------------------
    if data.txn_type == TransactionType.debit:
        update_budget_on_transaction(
            db=db,
            user_id=user_id,
            category=category,
            amount=data.amount
        )

    # -------------------------------
    # REAL-TIME ALERTS (SETTINGS BASED)
    # -------------------------------
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == user_id)
        .first()
    )

    if settings:
        message = (
            f"₹{data.amount} credited to your account"
            if data.txn_type == TransactionType.credit
            else f"₹{data.amount} debited from your account"
        )

        notify_transaction(
            db=db,
            user_id=user_id,
            settings=settings,
            message=message
        )
    return transaction


def update_budget_on_transaction(
    db: Session,
    user_id: int,
    category: str,
    amount: float
):
    now = datetime.utcnow()

    budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category == category,
        Budget.month == now.month,
        Budget.year == now.year,
        Budget.is_active == True
    ).first()

    if budget:
        budget.spent_amount += amount
        db.commit()

    

def get_account_transactions(
    db: Session,
    user_id: int,
    account_id: int
):
    return (
        db.query(Transaction)
        .join(Account)
        .filter(
            Transaction.account_id == account_id,
            Account.user_id == user_id
        )
        .order_by(Transaction.txn_date.desc())
        .all()
    )


def detect_transaction_category(description: str):
    desc = description.lower()

    if "food" in desc or "restaurant" in desc or "hotel" in desc:
        return "Food"
    if "uber" in desc or "ola" in desc:
        return "Travel"
    if "electricity" in desc or "bill" in desc:
        return "Bills"

    return "Others"

