from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.accounts.schemas import AccountCreate, AccountOut
from app.accounts.service import (
    create_account,
    get_user_accounts,
    get_account_by_id,
)
from app.dependencies import get_db, get_current_user_email
from app.models.user import User

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.post("/", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_user_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return create_account(db, user.id, account_in)


@router.get("/", response_model=list[AccountOut])
def list_user_accounts(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return get_user_accounts(db, user.id)


@router.get("/{account_id}", response_model=AccountOut)
def get_single_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    account = get_account_by_id(db, user.id, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return account
