from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
from decimal import Decimal

from app.dependencies import get_db, get_current_user
from app.budgets.schemas import BudgetCreate, BudgetWithStats
from app.budgets.service import (
    create_budget,
    get_budget_spent_amount,
    is_budget_exceeded,
)
from app.budgets.models import Budget, BudgetPeriod

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)


@router.post("/", response_model=BudgetWithStats, status_code=status.HTTP_201_CREATED)
def create_user_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        budget = create_budget(db, current_user.id, budget_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Calculate stats (initially zero)
    spent = Decimal("0.00")
    remaining = budget.limit_amount
    exceeded = False

    return {
        "id": budget.id,
        "category": budget.category,
        "limit_amount": budget.limit_amount,
        "period": budget.period,
        "created_at": budget.created_at,
        "spent_amount": spent,
        "remaining_amount": remaining,
        "is_exceeded": exceeded,
    }


@router.get("/", response_model=list[BudgetWithStats])
def list_user_budgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    results = []

    today = date.today()
    start_date = today.replace(day=1)
    end_date = today

    for budget in budgets:
        spent = get_budget_spent_amount(
            db,
            current_user.id,
            budget.category,
            start_date,
            end_date,
        )

        remaining = budget.limit_amount - spent
        exceeded = is_budget_exceeded(
            db,
            current_user.id,
            budget,
            start_date,
            end_date,
        )

        results.append({
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "period": budget.period,
            "created_at": budget.created_at,
            "spent_amount": spent,
            "remaining_amount": remaining,
            "is_exceeded": exceeded,
        })

    return results

