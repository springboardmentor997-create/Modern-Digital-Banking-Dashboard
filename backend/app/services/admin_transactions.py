from sqlalchemy.orm import Session
from datetime import date
from app.models.transaction import Transaction
from app.models.user import User


def fetch_admin_transactions(
    db: Session,
    category: str | None = None,
    txn_type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
):
    query = (
        db.query(
            Transaction.id,
            User.name.label("user_name"),
            User.email,
            Transaction.txn_type,
            Transaction.amount,
            Transaction.category,
            Transaction.txn_date,
        )
        .join(User, User.id == Transaction.user_id)
        .order_by(Transaction.txn_date.desc())
    )

    if category:
        query = query.filter(Transaction.category == category)

    if txn_type:
        query = query.filter(Transaction.txn_type == txn_type)

    if start_date:
        query = query.filter(Transaction.txn_date >= start_date)

    if end_date:
        query = query.filter(Transaction.txn_date <= end_date)

    return query.all()
