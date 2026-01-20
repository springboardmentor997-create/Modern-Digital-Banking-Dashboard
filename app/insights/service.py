from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.transaction import Transaction, TransactionType


def get_insights_summary(db: Session, user_id: int):
    income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.txn_type == TransactionType.credit,
        )
        .scalar()
    )

    expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.txn_type == TransactionType.debit,
        )
        .scalar()
    )

    return {
        "total_income": float(income),
        "total_expense": float(expense),
        "savings": float(income - expense),
    }


def get_monthly_spending(db: Session, user_id: int, month: int, year: int):
    rows = (
        db.query(
            Transaction.txn_date.label("date"),
            func.coalesce(func.sum(Transaction.amount), 0).label("amount"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.txn_type == TransactionType.debit,
            func.extract("month", Transaction.txn_date) == month,
            func.extract("year", Transaction.txn_date) == year,
        )
        .group_by(Transaction.txn_date)
        .order_by(Transaction.txn_date)
        .all()
    )

    return [
        {
            "date": str(r.date),
            "amount": float(r.amount),
        }
        for r in rows
    ]


def get_category_breakdown(db: Session, user_id: int, month: int, year: int):
    rows = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0).label("amount"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.txn_type == TransactionType.debit,
            func.extract("month", Transaction.txn_date) == month,
            func.extract("year", Transaction.txn_date) == year,
        )
        .group_by(Transaction.category)
        .all()
    )

    return [
        {
            "category": r.category or "Others",
            "amount": float(r.amount),
        }
        for r in rows
    ]
