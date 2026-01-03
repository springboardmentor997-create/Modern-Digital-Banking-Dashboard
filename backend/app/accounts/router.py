from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user, require_read_access, require_write_access
from app.models.user import User
from app.accounts.schemas import AccountCreate, AccountUpdate, AccountResponse
from app.accounts.service import AccountService

router = APIRouter()

@router.post("/", response_model=AccountResponse)
async def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(require_write_access),
    db: Session = Depends(get_db)
):
    account = AccountService.create_account(db, current_user.id, account_data)
    return account

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admins may see all accounts; regular users see only their own
    user_role = getattr(current_user, "role", "user")
    if user_role == "admin":
        accounts = AccountService.get_all_accounts(db)
    else:
        accounts = AccountService.get_user_accounts(db, current_user.id)
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch account without owner filter, then enforce access rules:
    account = AccountService.get_account_by_id_any(db, account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    # Allow if owner
    if account.user_id == current_user.id:
        return account

    # Allow if admin
    user_role = getattr(current_user, "role", "user")
    if user_role == "admin":
        return account

    # Otherwise forbid
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account_data: AccountUpdate,
    current_user: User = Depends(require_write_access),
    db: Session = Depends(get_db)
):
    # Allow admins to update any account; regular users only their own
    if getattr(current_user, "role", "user") == "admin":
        account = AccountService.get_account_by_id_any(db, account_id)
    else:
        account = AccountService.get_account_by_id(db, account_id, current_user.id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    updated_account = AccountService.update_account(db, account, account_data)
    return updated_account

@router.delete("/{account_id}")
async def delete_account(
    account_id: int,
    current_user: User = Depends(require_write_access),
    db: Session = Depends(get_db)
):
    # Allow admins to delete any account; regular users only their own
    account = AccountService.get_account_by_id_any(db, account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    if getattr(current_user, "role", "user") != "admin" and account.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Own account only")

    result = AccountService.delete_account(db, account)
    return {
        "message": f"Account {account_id} deleted",
        "transactions_deleted": result.get("txns_deleted", 0),
        "bills_deleted": result.get("bills_deleted", 0)
    }
