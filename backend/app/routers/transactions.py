from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction_schema import TransactionCreate, TransactionResponse
from app.dependencies import get_current_user
from datetime import date

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Transaction).where(Transaction.user_id == current_user.id)

    if type and type != 'all':
        query = query.where(Transaction.type == type)
    
    if category and category != 'all':
        query = query.where(Transaction.category == category)
        
    if start_date:
        query = query.where(Transaction.date >= start_date)
        
    if end_date:
        query = query.where(Transaction.date <= end_date)

    # Order by date descending
    query = query.order_by(Transaction.date.desc())

    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_transaction = Transaction(**transaction.dict(), user_id=current_user.id)
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    return new_transaction

@router.get("/recent", response_model=List[TransactionResponse])
async def get_recent_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.date.desc()).limit(5)
    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions
