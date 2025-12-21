from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.budget import Budget
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.budget_schema import BudgetCreate, BudgetResponse
from app.dependencies import get_current_user
from sqlalchemy import func

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch budgets
    result = await db.execute(select(Budget).where(Budget.user_id == current_user.id))
    budgets = result.scalars().all()
    
    # Calculate spent amount for each budget category from transactions
    # Note: In a real app, you might want to filter by current month/period
    for budget in budgets:
        # Sum expenses for this category
        stmt = select(func.sum(Transaction.amount)).where(
            Transaction.user_id == current_user.id,
            Transaction.category == budget.category,
            Transaction.type == 'expense'
        )
        spent_result = await db.execute(stmt)
        spent = spent_result.scalar() or 0.0
        budget.spent = spent
        
    return budgets

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if budget for category already exists
    result = await db.execute(select(Budget).where(
        Budget.user_id == current_user.id, 
        Budget.category == budget.category
    ))
    existing_budget = result.scalars().first()
    if existing_budget:
        raise HTTPException(status_code=400, detail="Budget for this category already exists")

    new_budget = Budget(**budget.dict(), user_id=current_user.id)
    db.add(new_budget)
    await db.commit()
    await db.refresh(new_budget)
    return new_budget

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Budget).where(Budget.id == id, Budget.user_id == current_user.id))
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    await db.delete(budget)
    await db.commit()
    return None
