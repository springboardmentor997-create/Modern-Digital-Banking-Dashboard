from sqlalchemy.orm import Session
from decimal import Decimal

from app.transactions.models import Transaction, TransactionType
from app.transactions.schemas import TransactionCreate
from app.accounts.models import Account

from sqlalchemy import extract, func

from app.budgets.models import Budget

from datetime import datetime, timedelta

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


def get_monthly_total_spent(
    db: Session,
    user_id: int,
    year: int,
    month: int,
) -> float:
    """
    Returns total expense amount for a user in a given month/year
    """

    total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == year)
        .filter(extract("month", Transaction.transaction_date) == month)
        .scalar()
    )

    return float(total)



def get_budget_vs_actual(db: Session, user_id: int):
    """
    Returns budget vs actual spending for each budget of a user.
    """

    results = []

    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .all()
    )

    for budget in budgets:
        spent = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(Transaction.user_id == user_id)
            .filter(Transaction.transaction_type == TransactionType.expense)
            .filter(Transaction.category == budget.category)
            .filter(Transaction.transaction_date >= budget.start_date)
            .filter(Transaction.transaction_date <= budget.end_date)
            .scalar()
        )

        spent = float(spent)
        remaining = float(budget.amount) - spent

        results.append({
            "budget_id": budget.id,
            "category": budget.category,
            "limit": float(budget.amount),
            "spent": spent,
            "remaining": remaining,
            "exceeded": spent > float(budget.amount),
        })

    return results


def get_monthly_spending_by_category(
    db,
    user_id: int,
):
    now = datetime.utcnow()

    results = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0),
        )
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == now.year)
        .filter(extract("month", Transaction.transaction_date) == now.month)
        .group_by(Transaction.category)
        .all()
    )

    return [
        {
            "category": row[0].value if hasattr(row[0], "value") else row[0],
            "total": float(row[1]),
        }
        for row in results
    ]


def get_monthly_spending_trend(
    db,
    user_id: int,
):
    now = datetime.utcnow()

    # Current month
    current_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == now.year)
        .filter(extract("month", Transaction.transaction_date) == now.month)
        .scalar()
    )

    # Previous month
    prev_month_date = now.replace(day=1) - timedelta(days=1)

    previous_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id)
        .filter(Transaction.transaction_type == TransactionType.expense)
        .filter(extract("year", Transaction.transaction_date) == prev_month_date.year)
        .filter(extract("month", Transaction.transaction_date) == prev_month_date.month)
        .scalar()
    )

    change = float(current_total) - float(previous_total)

    if change > 0:
        trend = "increase"
    elif change < 0:
        trend = "decrease"
    else:
        trend = "no_change"

    return {
        "current_month": now.strftime("%Y-%m"),
        "current_total": float(current_total),
        "previous_month": prev_month_date.strftime("%Y-%m"),
        "previous_total": float(previous_total),
        "change": change,
        "trend": trend,
    }
