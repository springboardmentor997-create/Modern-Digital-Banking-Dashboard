from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.account import Account
from app.models.user import User
from app.schemas.account_schema import AccountCreate, AccountResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    accounts = result.scalars().all()
    return accounts

@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account: AccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if account number already exists
    result = await db.execute(select(Account).where(Account.account_number == account.account_number))
    existing_account = result.scalars().first()
    if existing_account:
        raise HTTPException(status_code=400, detail="Account number already exists")

    new_account = Account(**account.dict(), user_id=current_user.id)
    db.add(new_account)
    await db.commit()
    await db.refresh(new_account)
    return new_account

@router.get("/{id}", response_model=AccountResponse)
async def get_account(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Account).where(Account.id == id, Account.user_id == current_user.id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Account).where(Account.id == id, Account.user_id == current_user.id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    await db.delete(account)
    await db.commit()
    return None
