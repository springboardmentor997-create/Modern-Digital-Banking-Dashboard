from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import date

from app.budgets.models import Budget
from app.budgets.schemas import BudgetCreate
from app.transactions.models import Transaction, TransactionType, TransactionCategory


def create_budget(
    db: Session,
    user_id: int,
    budget_in: BudgetCreate,
):
    # Prevent duplicate budgets (category + period per user)
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category == budget_in.category,
            Budget.period == budget_in.period,
        )
        .first()
    )

    if existing:
        raise ValueError("Budget already exists for this category and period")

    budget = Budget(
        user_id=user_id,
        category=budget_in.category,  # already validated by schema
        limit_amount=budget_in.limit_amount,
        period=budget_in.period,
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return budget


def get_budget_spent_amount(
    db: Session,
    user_id: int,
    category: str,
    start_date: date,
    end_date: date,
) -> Decimal:
    """
    IMPORTANT:
    - category comes from Budget (string)
    - DB expects TransactionCategory enum values (lowercase)
    """

    normalized_category = TransactionCategory(category.lower())

    total = (
        db.query(Transaction.amount)
        .filter(
            Transaction.user_id == user_id,
            Transaction.category == normalized_category,
            Transaction.transaction_type == TransactionType.expense,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
        )
        .all()
    )

    return sum((row[0] for row in total), Decimal("0.00"))


def is_budget_exceeded(
    db: Session,
    user_id: int,
    budget: Budget,
    start_date: date,
    end_date: date,
) -> bool:
    spent = get_budget_spent_amount(
        db,
        user_id,
        budget.category,
        start_date,
        end_date,
    )

    return spent > budget.limit_amount
