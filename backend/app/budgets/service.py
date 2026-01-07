from sqlalchemy.orm import Session
from app.budgets.models import Budget
from sqlalchemy import func

def create_budget(db: Session, user_id: int, data):
    # Prevent duplicate active budget for same month/category
    existing = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == data.month,
        Budget.year == data.year,
        Budget.category == data.category,
        Budget.is_active == True
    ).first()

    if existing:
        return None

    budget = Budget(
        user_id=user_id,
        month=data.month,
        year=data.year,
        category=data.category,
        limit_amount=data.limit_amount,
        spent_amount=0
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def get_user_budgets(db: Session, user_id: int, month: int, year: int):
    return db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year,
        Budget.is_active == True
    ).all()


def update_budget(db: Session, user_id: int, budget_id: int, limit_amount):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user_id,
        Budget.is_active == True
    ).first()

    if not budget:
        return None

    budget.limit_amount = limit_amount
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, user_id: int, budget_id: int):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user_id,
        Budget.is_active == True
    ).first()

    if not budget:
        return False

    budget.is_active = False
    db.commit()
    return True


def get_budget_summary(db: Session, user_id: int, month: int, year: int):
    total_limit, total_spent = db.query(
        func.coalesce(func.sum(Budget.limit_amount), 0),
        func.coalesce(func.sum(Budget.spent_amount), 0)
    ).filter(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year,
        Budget.is_active == True
    ).one()

    return {
        "total_limit": float(total_limit),
        "total_spent": float(total_spent),
        "remaining": float(total_limit - total_spent)
    }