from sqlalchemy.orm import Session
from app.models.account import Account
from app.models.user import User
from app.accounts.schemas import AccountCreate

def create_account(
    db: Session,
    user: User,
    account_data: AccountCreate
):
    account = Account(
        user_id=user.id,
        bank_name=account_data.bank_name,
        account_type=account_data.account_type,
        masked_account=account_data.masked_account,
        currency=account_data.currency,
        balance=account_data.balance
    )

    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_user_accounts(db: Session, user: User):
    return db.query(Account).filter(Account.user_id == user.id).all()
