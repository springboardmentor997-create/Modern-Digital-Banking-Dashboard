from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.budgets.schemas import BudgetCreate, BudgetUpdate
from typing import List, Optional
from datetime import datetime
import logging

# Set up logging to see errors in the console
logger = logging.getLogger(__name__)

# Category mapping: category_id -> category_name
CATEGORY_MAP = {
    1: "Food & Dining",
    2: "Transportation",
    3: "Shopping",
    4: "Entertainment",
    5: "Bills & Utilities",
    6: "Healthcare",
    7: "Income",
    8: "General"
}

class BudgetService:
    
    @staticmethod
    def create_budget(db: Session, budget_data: BudgetCreate, user_id: int) -> Budget:
        try:
            # Get category name from category_id
            category_name = CATEGORY_MAP.get(budget_data.category_id, "General")
            
            db_budget = Budget(
                user_id=user_id,
                name=budget_data.name,
                limit_amount=budget_data.amount,
                category_id=budget_data.category_id,
                category=category_name,
                spent_amount=0.0,
                month=budget_data.month,
                year=budget_data.year
            )
            
            # Calculate initial spent amount
            db_budget.spent_amount = BudgetService._calculate_spent_amount(
                db, user_id, budget_data.category_id, budget_data.month, budget_data.year
            )
            
            db.add(db_budget)
            db.commit()
            db.refresh(db_budget)
            return db_budget
            
        except Exception as e:
            db.rollback()
            logger.error(f"CREATE BUDGET ERROR: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create budget: {str(e)}"
            )
    
    @staticmethod
    def get_budgets(
        db: Session, 
        user_id: int, 
        month: Optional[int] = None, 
        year: Optional[int] = None,
        category: Optional[str] = None
    ) -> List[Budget]:
        try:
            query = db.query(Budget).filter(Budget.user_id == user_id)
            
            if month:
                query = query.filter(Budget.month == month)
            if year:
                query = query.filter(Budget.year == year)
            
            budgets = query.all()
            
            # Recalculate spent amounts for each budget
            for budget in budgets:
                budget.spent_amount = BudgetService._calculate_spent_amount(
                    db, user_id, budget.category_id, budget.month, budget.year
                )
            
            db.commit()
            return budgets
            
        except Exception as e:
            logger.error(f"FETCH ERROR: {str(e)}")
            return []
    
    @staticmethod
    def get_budget_by_id(db: Session, budget_id: int, user_id: int) -> Optional[Budget]:
        budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if budget:
            budget.spent_amount = BudgetService._calculate_spent_amount(
                db, user_id, budget.category_id, budget.month, budget.year
            )
            db.commit()
        return budget

    @staticmethod
    def update_budget(db: Session, budget_id: int, budget_data: BudgetUpdate, user_id: int) -> Optional[Budget]:
        db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if not db_budget:
            return None
        
        update_data = budget_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key == 'amount':
                setattr(db_budget, 'limit_amount', value)
            elif key == 'category_id':
                setattr(db_budget, 'category_id', value)
                setattr(db_budget, 'category', CATEGORY_MAP.get(value, "General"))
            else:
                setattr(db_budget, key, value)
        
        db_budget.spent_amount = BudgetService._calculate_spent_amount(
            db, user_id, db_budget.category_id, db_budget.month, db_budget.year
        )
        
        db.commit()
        db.refresh(db_budget)
        return db_budget
    
    @staticmethod
    def delete_budget(db: Session, budget_id: int, user_id: int) -> bool:
        budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if not budget:
            return False
        
        db.delete(budget)
        db.commit()
        return True

    @staticmethod
    def _calculate_spent_amount(db: Session, user_id: int, category_id: int, month: int, year: int) -> float:
        """
        Calculate total spent for a category by matching category name from category_id.
        """
        try:
            # Get category name from category_id
            category_name = CATEGORY_MAP.get(category_id, "General")
            
            # Query debit transactions matching the category name
            query = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                func.extract('month', Transaction.txn_date) == month,
                func.extract('year', Transaction.txn_date) == year,
                Transaction.txn_type == 'debit',
                Transaction.category == category_name  # Match by category name
            )

            spent = query.scalar()
            result = abs(float(spent)) if spent else 0.0
            
            logger.info(f"Calculated spent for category '{category_name}' (id={category_id}): {result}")
            return result
            
        except Exception as e:
            logger.error(f"CALCULATION ERROR: {str(e)}")
            return 0.0

    @staticmethod
    def check_budget_alerts(db: Session, user_id: int, category_name: str, amount: float):
        """
        Check if a transaction will exceed budget limits.
        Accepts category name (string) from transaction.
        """
        now = datetime.now()

        try:
            # Find budget by matching category name
            budget = db.query(Budget).filter(
                Budget.user_id == user_id,
                Budget.category == category_name,
                Budget.month == now.month,
                Budget.year == now.year
            ).first()
            
            if not budget:
                logger.info(f"No budget found for category '{category_name}'")
                return {"status": "ok"}
            
            # Calculate current spent amount
            current_spent = BudgetService._calculate_spent_amount(
                db, user_id, budget.category_id, now.month, now.year
            )
            
            new_total = current_spent + abs(amount)
            limit = float(budget.limit_amount)
            
            logger.info(f"Budget check for '{budget.name}': {current_spent} + {abs(amount)} = {new_total} / {limit}")
            
            if new_total > limit:
                # Update spent amount and create alert
                budget.spent_amount = new_total
                db.commit()
                
                return {
                    "alert": True,
                    "message": f"This transaction exceeds your '{budget.name}' budget! You've spent {new_total:.2f} of {limit:.2f}",
                    "remaining": limit - current_spent,
                    "budget_name": budget.name
                }
            elif new_total > (limit * 0.8):
                # Update spent amount
                budget.spent_amount = new_total
                db.commit()
                
                return {
                    "warning": True,
                    "message": f"You've used {(new_total/limit*100):.0f}% of your '{budget.name}' budget ({new_total:.2f} / {limit:.2f})",
                    "budget_name": budget.name
                }
            else:
                # Update spent amount
                budget.spent_amount = new_total
                db.commit()
        
        except Exception as e:
            logger.error(f"BUDGET CHECK ERROR: {e}")
        
        return {"status": "ok"}
    
    @staticmethod
    def get_budget_summary(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
        try:
            query = db.query(Budget).filter(Budget.user_id == user_id)
            
            if month:
                query = query.filter(Budget.month == month)
            if year:
                query = query.filter(Budget.year == year)
            
            budgets = query.all()
            
            # Recalculate spent amounts
            for budget in budgets:
                budget.spent_amount = BudgetService._calculate_spent_amount(
                    db, user_id, budget.category_id, budget.month, budget.year
                )
            db.commit()
            
            total_budget = sum(float(b.limit_amount) for b in budgets)
            total_spent = sum(float(b.spent_amount) for b in budgets)
            
            return {
                "total_budget": total_budget,
                "total_spent": total_spent,
                "remaining": total_budget - total_spent,
                "count": len(budgets)
            }
        except Exception as e:
            logger.error(f"SUMMARY ERROR: {str(e)}")
            return {
                "total_budget": 0,
                "total_spent": 0,
                "remaining": 0,
                "count": 0
            }