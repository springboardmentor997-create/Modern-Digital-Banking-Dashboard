from sqlalchemy.orm import Session
from app.models.user import User
from app.accounts.models import Account
from app.transactions.models import Transaction


def get_all_users(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()


def get_all_accounts(db: Session):
    return db.query(Account).order_by(Account.created_at.desc()).all()


def get_all_transactions(db: Session):
    return db.query(Transaction).order_by(Transaction.transaction_date.desc()).all()
