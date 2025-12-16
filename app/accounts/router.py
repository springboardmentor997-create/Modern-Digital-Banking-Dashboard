from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.accounts.schemas import AccountCreate, AccountResponse
from app.accounts.service import create_account, get_user_accounts
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/accounts", tags=["Accounts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=AccountResponse, status_code=201)
def create_user_account(
    account: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_account(db, current_user, account)


@router.get("", response_model=List[AccountResponse])
def list_user_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_accounts(db, current_user)
