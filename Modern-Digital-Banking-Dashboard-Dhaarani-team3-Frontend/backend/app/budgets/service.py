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


def update_budget_spent(db: Session, transaction, user_id: int):
	"""Update matching budget's spent_amount for same month/year/category.

	This function quietly does nothing if no matching budget exists or
	the transaction isn't a debit.
	"""
	# Import here to avoid circular imports at module import time
	from app.models.budget import Budget

	# transaction.txn_date is a datetime-like object
	try:
		txn_month = transaction.txn_date.month
		txn_year = transaction.txn_date.year
	except Exception:
		return

	# Load budgets for the user/month/year then match category in Python
	candidates = db.query(Budget).filter(
		Budget.user_id == user_id,
		Budget.month == txn_month,
		Budget.year == txn_year,
	).all()

	if not candidates:
		return

	# Only update for outgoing/debit transactions (any type indicating money left the account)
	txn_type = (getattr(transaction, 'txn_type', None) or '').lower()
	# Match debit, money out, withdraw, expense, payment, transfer out, etc.
	is_outgoing = any(keyword in txn_type for keyword in ['debit', 'out', 'withdraw', 'expense', 'payment', 'transfer'])
	if not is_outgoing:
		return

	from decimal import Decimal
	try:
		amt = Decimal(str(transaction.amount))
	except Exception:
		try:
			amt = Decimal(transaction.amount)
		except Exception:
			return

	txn_cat = (transaction.category or '').strip().lower()

	for budget in candidates:
		bud_cat = (budget.category or '').strip().lower()
		if bud_cat == txn_cat:
			try:
				current = Decimal(str(budget.spent_amount)) if budget.spent_amount is not None else Decimal("0")
			except Exception:
				current = Decimal("0")

			budget.spent_amount = current + amt
			db.commit()
			try:
				db.refresh(budget)
			except Exception:
				pass
			# update only the first matching budget
			return
