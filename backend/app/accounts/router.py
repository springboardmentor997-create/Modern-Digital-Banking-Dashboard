from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from decimal import Decimal
from pydantic import EmailStr
from app.database import get_db
from app.accounts.schemas import AccountCreate, AccountResponse, AccountUpdate, AccountBalance
from app.accounts.service import AccountService
from app.dependencies import get_current_user
from app.models.account import Account
from app.models.account import Account

router = APIRouter(tags=["Accounts"])

@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    account: AccountCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    try:
        return AccountService.create_account(db, account, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return AccountService.get_accounts(db, current_user.id)


@router.get("/by-email")
def lookup_account_by_email(
    email: EmailStr = Query(..., description="Email of the user"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lookup a user by email and return their accounts (requires auth).

    This endpoint is case-insensitive and returns an empty list when no user is found
    so clients can handle "not found" uniformly without relying on 404 errors.
    """
    from app.models.user import User

    email_norm = email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_norm).first()

    if not user:
        # Return an empty list (200) when the email is not found to simplify client handling
        return []

    accounts = db.query(Account).filter(Account.user_id == user.id).all()

    return [{
        "id": account.id,
        "name": account.name,
        "account_type": account.account_type,
        "balance": float(account.balance),
        "bank_name": account.bank_name
    } for account in accounts]

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    account = AccountService.get_account_by_id(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account_data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    account = AccountService.update_account(db, account_id, account_data, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = AccountService.delete_account(db, account_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully", "transactions_deleted": 0}

@router.get("/{account_id}/balance", response_model=AccountBalance)
def get_account_balance(
    account_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    balance = AccountService.get_account_balance(db, account_id, current_user.id)
    if balance is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return AccountBalance(account_id=account_id, balance=balance)

