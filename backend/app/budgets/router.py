from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from app.database import get_db
from app.budgets.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.budgets.service import BudgetService
from app.dependencies import get_current_user

router = APIRouter(tags=["Budgets"])

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return BudgetService.create_budget(db, budget, current_user.id)

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    month: Optional[int] = Query(None, description="Filter by month"),
    year: Optional[int] = Query(None, description="Filter by year"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return BudgetService.get_budgets(db, current_user.id, month, year, category)

@router.get("/categories")
def get_budget_categories(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Returns the list directly so the frontend can map it immediately
    return [
        {"id": 1, "name": "Food & Dining", "icon": "🍔"},
        {"id": 2, "name": "Transportation", "icon": "🚗"},
        {"id": 3, "name": "Shopping", "icon": "🛍️"},
        {"id": 4, "name": "Entertainment", "icon": "🎬"},
        {"id": 5, "name": "Bills & Utilities", "icon": "💡"},
        {"id": 6, "name": "Healthcare", "icon": "🏥"},
        {"id": 7, "name": "Income", "icon": "💰"},
        {"id": 8, "name": "General", "icon": "📦"}
    ]

@router.get("/summary")
def get_budget_summary(
    month: Optional[int] = Query(None, description="Month for summary"),
    year: Optional[int] = Query(None, description="Year for summary"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return BudgetService.get_budget_summary(db, current_user.id, month, year)

@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    budget = BudgetService.get_budget_by_id(db, budget_id, current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    budget = BudgetService.update_budget(db, budget_id, budget_data, current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = BudgetService.delete_budget(db, budget_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")
    return None