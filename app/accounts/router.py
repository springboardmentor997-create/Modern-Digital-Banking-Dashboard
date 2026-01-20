"""
Accounts Router

What:
- API endpoints for bank accounts
- Create, fetch user accounts

Backend Connections:
- Uses:
  - Account model
  - account service
  - auth dependency

Frontend Connections:
- AddAccount.jsx → POST /accounts
- Accounts.jsx → GET /accounts
- SendMoney.jsx → account dropdown

Important:
- Transaction PIN is created here
"""



from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.accounts.schemas import AccountCreate, AccountResponse
from app.accounts.service import (
    create_account,
    get_user_accounts,
    delete_account
)
from app.dependencies import get_current_user
from app.models.user import User
from app.accounts.schemas import AccountDelete
from app.accounts.service import delete_account_with_pin
from app.models.account import Account
from app.accounts.schemas import ChangePinSchema
from app.utils.hashing import Hash


router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

# -----------------------------
# CREATE ACCOUNT
# -----------------------------
@router.post(
    "",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_account(
    account: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔐 PIN validation (CORRECT PLACE)
    if not account.pin.isdigit():
        raise HTTPException(
            status_code=400,
            detail="PIN must contain only digits"
        )

    return create_account(db, current_user, account)

# -----------------------------
# LIST USER ACCOUNTS
# -----------------------------
@router.get(
    "",
    response_model=List[AccountResponse]
)
def list_user_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_accounts(db, current_user)

# -----------------------------
# DELETE ACCOUNT
# -----------------------------
@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user_account(
    account_id: int,
    payload: AccountDelete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.pin.isdigit():
        raise HTTPException(
            status_code=400,
            detail="PIN must contain only digits"
        )

    delete_account_with_pin(
        db=db,
        user=current_user,
        account_id=account_id,
        pin=payload.pin
    )



@router.post("/change-pin")
def change_pin(
    data: ChangePinSchema,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    if not data.new_pin.isdigit() or len(data.new_pin) != 4:
        raise HTTPException(status_code=400, detail="PIN must be a 4-digits")


    account = db.query(Account).filter(
        Account.id == data.account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.pin = Hash.bcrypt(data.new_pin)
    db.commit()

    return {"message": "PIN updated successfully"}
