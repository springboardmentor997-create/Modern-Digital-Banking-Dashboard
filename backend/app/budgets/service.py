from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import date

from app.budgets.models import Budget
from app.budgets.schemas import BudgetCreate
from app.transactions.models import Transaction, TransactionType, TransactionCategory

from app.alerts.service import create_budget_exceeded_alert

from calendar import monthrange


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


def get_budget_vs_actual(db: Session, user_id: int):
    """
    Returns budget vs actual spending for all budgets of a user.
    Assumes monthly budgets.
    """

    results = []

    today = date.today()
    start_date = date(today.year, today.month, 1)
    end_date = date(today.year, today.month, monthrange(today.year, today.month)[1])

    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .all()
    )

    for budget in budgets:
        spent = get_budget_spent_amount(
            db=db,
            user_id=user_id,
            category=budget.category,
            start_date=start_date,
            end_date=end_date,
        )

        spent_float = float(spent)
        limit_float = float(budget.limit_amount)

        results.append({
            "budget_id": budget.id,
            "category": budget.category,
            "limit": limit_float,
            "spent": spent_float,
            "remaining": limit_float - spent_float,
            "exceeded": spent_float > limit_float,
        })

    return results


def trigger_budget_alerts(db: Session, user_id: int):
    """
    Creates alerts for budgets that are exceeded.
    """

    results = get_budget_vs_actual(db=db, user_id=user_id)

    created_alerts = []

    for item in results:
        if item["exceeded"]:
            alert = create_budget_exceeded_alert(
                db=db,
                user_id=user_id,
                category=item["category"],
                amount=item["spent"] - item["limit"],
            )
            created_alerts.append(alert)

    return created_alerts
