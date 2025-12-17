from sqlalchemy.orm import Session
from app.models.account import Account
from app.models.user import User
from app.accounts.schemas import AccountCreate, AccountUpdate


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


def get_account_by_id(
    db: Session,
    user: User,
    account_id: int
):
    return db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user.id
    ).first()


def update_account(
    db: Session,
    user: User,
    account_id: int,
    account_data: AccountUpdate
):
    account = get_account_by_id(db, user, account_id)
    if not account:
        return None

    for key, value in account_data.dict(exclude_unset=True).items():
        setattr(account, key, value)

    db.commit()
    db.refresh(account)
    return account


def delete_account(
    db: Session,
    user: User,
    account_id: int
):
    account = get_account_by_id(db, user, account_id)
    if not account:
        return False

    db.delete(account)
    db.commit()
    return True
