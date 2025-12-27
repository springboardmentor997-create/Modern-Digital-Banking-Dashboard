from sqlalchemy.orm import Session
from sqlalchemy import func

from app.accounts.models import Account
from app.accounts.schemas import AccountCreate


def create_account(
    db: Session,
    user_id: int,
    account_in: AccountCreate
):
    account = Account(
        user_id=user_id,
        bank_name=account_in.bank_name,
        account_type=account_in.account_type,
        masked_account=account_in.masked_account,
        currency=account_in.currency,
        balance=account_in.balance,
    )

    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_user_accounts(db: Session, user_id: int):
    return (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.created_at.desc())
        .all()
    )


def get_account_by_id(db: Session, user_id: int, account_id: int):
    return (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == user_id
        )
        .first()
    )


def get_account_summary(db: Session, user_id: int):
    """
    Returns total accounts count and total balance for a user
    """

    total_accounts = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .count()
    )

    total_balance = (
        db.query(func.coalesce(func.sum(Account.balance), 0.0))
        .filter(Account.user_id == user_id)
        .scalar()
    )

    return {
        "total_accounts": total_accounts,
        "total_balance": float(total_balance),
    }
