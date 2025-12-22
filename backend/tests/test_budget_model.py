from decimal import Decimal
from app.database import SessionLocal
from app.budgets.models import Budget, BudgetPeriod

db = SessionLocal()

# use an existing user_id
USER_ID = 2

budget = Budget(
    user_id=USER_ID,
    category="food",
    limit_amount=Decimal("5000.00"),
    period=BudgetPeriod.monthly
)

db.add(budget)
db.commit()
db.refresh(budget)

print("Budget inserted with ID:", budget.id)

# Fetch
budgets = db.query(Budget).filter(Budget.user_id == USER_ID).all()
print("Budgets for user:", len(budgets))

db.close()
