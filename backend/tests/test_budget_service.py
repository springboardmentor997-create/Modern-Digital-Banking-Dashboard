from datetime import date, timedelta
from decimal import Decimal

from app.budgets.models import Budget

from app.database import SessionLocal
from app.budgets.schemas import BudgetCreate
from app.budgets.service import (
    create_budget,
    get_budget_spent_amount,
    is_budget_exceeded,
)
from app.budgets.models import BudgetPeriod

db = SessionLocal()

USER_ID = 2  # as agreed


print("Creating budget...")
try:
    budget = create_budget(
        db,
        USER_ID,
        BudgetCreate(
            category="food",
            limit_amount=Decimal("1000.00"),
            period=BudgetPeriod.monthly,
        )
    )
    print("Budget created:", budget.id)
except ValueError as e:
    print("Budget already exists, fetching existing one...")
    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == USER_ID,
            Budget.category == "food",
            Budget.period == BudgetPeriod.monthly,
        )
        .first()
    )


print("Calculating spent amount...")
spent = get_budget_spent_amount(
    db,
    USER_ID,
    category="food",
    start_date=date.today() - timedelta(days=30),
    end_date=date.today(),
)
print("Spent amount:", spent)

print("Checking if budget exceeded...")
exceeded = is_budget_exceeded(
    db,
    USER_ID,
    budget,
    start_date=date.today() - timedelta(days=30),
    end_date=date.today(),
)
print("Budget exceeded:", exceeded)

db.close()
