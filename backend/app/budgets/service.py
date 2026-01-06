from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.budgets.schemas import BudgetCreate, BudgetUpdate


class BudgetService:
	@staticmethod
	def create_budget(db: Session, user_id: int, budget_data: BudgetCreate):
		new_budget = Budget(
			user_id=user_id,
			month=budget_data.month,
			year=budget_data.year,
			category=budget_data.category,
			limit_amount=budget_data.limit_amount,
			spent_amount=budget_data.spent_amount or 0,
		)

		db.add(new_budget)
		db.commit()
		db.refresh(new_budget)

		return new_budget

	@staticmethod
	def get_user_budgets(db: Session, user_id: int, month: int = None, year: int = None):
		query = db.query(Budget).filter(Budget.user_id == user_id)
		if month is not None:
			query = query.filter(Budget.month == month)
		if year is not None:
			query = query.filter(Budget.year == year)
		return query.order_by(Budget.created_at.desc()).all()

	@staticmethod
	def get_all_budgets(db: Session, month: int = None, year: int = None):
		query = db.query(Budget)
		if month is not None:
			query = query.filter(Budget.month == month)
		if year is not None:
			query = query.filter(Budget.year == year)
		return query.order_by(Budget.created_at.desc()).all()

	@staticmethod
	def get_budget_by_id(db: Session, budget_id: int, user_id: int):
		return db.query(Budget).filter(
			Budget.id == budget_id,
			Budget.user_id == user_id
		).first()

	@staticmethod
	def update_budget(db: Session, budget: Budget, budget_data: BudgetUpdate):
		for key, value in budget_data.dict(exclude_unset=True).items():
			setattr(budget, key, value)

		db.commit()
		db.refresh(budget)

		return budget

	@staticmethod
	def delete_budget(db: Session, budget: Budget):
		db.delete(budget)
		db.commit()
