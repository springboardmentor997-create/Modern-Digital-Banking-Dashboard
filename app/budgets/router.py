from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from app.budgets.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.budgets.service import (
    create_budget,
    get_user_budgets,
    update_budget,
    delete_budget,
    get_budget_summary
)

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)

# --------------------
# CREATE BUDGET
# --------------------
@router.post("", response_model=BudgetResponse)
def create_user_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = create_budget(db, current_user.id, payload)

    if not budget:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month"
        )

    return budget


# --------------------
# LIST BUDGETS
# --------------------
@router.get("", response_model=list[BudgetResponse])
def list_user_budgets(
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_budgets(db, current_user.id, month, year)


# --------------------
# BUDGET SUMMARY
# --------------------
@router.get("/summary")
def budget_summary(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_budget_summary(db, current_user.id, month, year)


# --------------------
# UPDATE BUDGET
# --------------------
@router.patch("/{budget_id}", response_model=BudgetResponse)
def edit_user_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = update_budget(
        db,
        current_user.id,
        budget_id,
        payload.limit_amount
    )

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    return budget


# --------------------
# DELETE BUDGET (SOFT)
# --------------------
@router.delete("/{budget_id}")
def remove_user_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = delete_budget(db, current_user.id, budget_id)

    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")

    return {"status": "success"}
