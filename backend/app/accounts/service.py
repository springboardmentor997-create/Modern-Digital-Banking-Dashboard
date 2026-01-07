"""
Account Service (Business Logic)

What:
- Handles account creation logic
- Hashes transaction PIN
- Ensures account belongs to user

Backend Connections:
- Called by accounts.router
- Uses Account model & database

Frontend Connections:
- AddAccount.jsx
"""



from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.utils.hashing import Hash
from app.models.account import Account
from app.models.user import User
from app.accounts.schemas import AccountCreate
from app.models.transaction import Transaction, TransactionType

def mask_account_number(account_number: str) -> str:
    """
    Example:
    123456789012 → XXXX-XXXX-9012
    """
    last4 = account_number[-4:]
    return f"XXXX-XXXX-{last4}"


def create_account(db: Session, user: User, account_data: AccountCreate):
    existing = db.query(Account).filter(
        Account.user_id == user.id,
        Account.masked_account.like(f"%{account_data.account_number[-4:]}"),
        Account.is_active == True
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already added"
        )

    masked = mask_account_number(account_data.account_number)

    account = Account(
        user_id=user.id,
        bank_name=account_data.bank_name,
        account_type=account_data.account_type,
        masked_account=masked,
        balance=1000,
        currency="INR",
        pin_hash=Hash.bcrypt(account_data.pin),  # 🔐 HASHED PIN
    )

    db.add(account)
    db.commit()
    db.refresh(account)
    return account



def get_user_accounts(db: Session, user: User):
    return db.query(Account).filter(
        Account.user_id == user.id,
        Account.is_active == True
    ).all()



def get_account_by_id(db: Session, user: User, account_id: int):
    return db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user.id
    ).first()


def delete_account(db: Session, user: User, account_id: int):
    account = get_account_by_id(db, user, account_id)
    if not account:
        return False

    db.delete(account)
    db.commit()
    return True


def delete_account_with_pin(db, user, account_id, pin):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user.id,
        Account.is_active == True
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # PIN check
    if not Hash.verify(account.pin_hash, pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    # ✅ SOFT DELETE
    account.is_active = False
    db.commit()

    return {"message": "Account removed successfully"}
