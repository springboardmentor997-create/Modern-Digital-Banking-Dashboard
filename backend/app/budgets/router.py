from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_auditor_or_admin
from app.models.user import User
from app.budgets.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from app.budgets.service import BudgetService

router = APIRouter()


@router.post("/", response_model=BudgetResponse)
async def create_budget(
	budget_data: BudgetCreate,
	current_user: User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	budget = BudgetService.create_budget(db, current_user.id, budget_data)
	return budget


@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
	month: Optional[int] = Query(None),
	year: Optional[int] = Query(None),
	current_user: User = Depends(require_auditor_or_admin),
	db: Session = Depends(get_db)
):
	# Admins and auditors can list budgets (auditor read-only)
	budgets = BudgetService.get_user_budgets(db, current_user.id, month=month, year=year)
	return budgets


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
	budget_id: int,
	current_user: User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	budget = BudgetService.get_budget_by_id(db, budget_id, current_user.id)

	if not budget:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Budget not found"
		)

	return budget


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
	budget_id: int,
	budget_data: BudgetUpdate,
	current_user: User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	budget = BudgetService.get_budget_by_id(db, budget_id, current_user.id)

	if not budget:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Budget not found"
		)

	updated = BudgetService.update_budget(db, budget, budget_data)
	return updated


@router.delete("/{budget_id}")
async def delete_budget(
	budget_id: int,
	current_user: User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	budget = BudgetService.get_budget_by_id(db, budget_id, current_user.id)

	if not budget:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Budget not found"
		)

	BudgetService.delete_budget(db, budget)
	return {"message": "Budget deleted successfully"}

