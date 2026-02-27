from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseAnalytics
import random

class ExpenseService:
    
    @staticmethod
    def create_expense(db: Session, expense_data: ExpenseCreate, user_id: int) -> Expense:
        db_expense = Expense(
            user_id=user_id,
            amount=expense_data.amount,
            description=expense_data.description,
            category=expense_data.category,
            location=expense_data.location,
            merchant=expense_data.merchant,
            has_receipt=expense_data.has_receipt,
            ai_suggested=expense_data.ai_suggested
        )
        
        if expense_data.expense_date:
            try:
                db_expense.expense_date = datetime.fromisoformat(expense_data.expense_date.replace('Z', '+00:00'))
            except:
                pass
        
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        return db_expense
    
    @staticmethod
    def get_expenses(db: Session, user_id: int, limit: int = 50, offset: int = 0, 
                    category: Optional[str] = None, start_date: Optional[datetime] = None,
                    end_date: Optional[datetime] = None) -> List[Expense]:
        query = db.query(Expense).filter(Expense.user_id == user_id)
        
        if category:
            query = query.filter(Expense.category.ilike(f"%{category}%"))
        if start_date:
            query = query.filter(Expense.expense_date >= start_date)
        if end_date:
            query = query.filter(Expense.expense_date <= end_date)
        
        return query.order_by(desc(Expense.expense_date)).offset(offset).limit(limit).all()
    
    @staticmethod
    def get_expense_by_id(db: Session, expense_id: int, user_id: int) -> Optional[Expense]:
        return db.query(Expense).filter(
            Expense.id == expense_id, 
            Expense.user_id == user_id
        ).first()
    
    @staticmethod
    def update_expense(db: Session, expense_id: int, expense_data: ExpenseUpdate, user_id: int) -> Optional[Expense]:
        expense = ExpenseService.get_expense_by_id(db, expense_id, user_id)
        if not expense:
            return None
        
        update_data = expense_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        db.commit()
        db.refresh(expense)
        return expense
    
    @staticmethod
    def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
        expense = ExpenseService.get_expense_by_id(db, expense_id, user_id)
        if not expense:
            return False
        
        db.delete(expense)
        db.commit()
        return True
    
    @staticmethod
    def get_analytics(db: Session, user_id: int, days: int = 30) -> ExpenseAnalytics:
        start_date = datetime.now() - timedelta(days=days)
        
        expenses = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_date
        ).all()
        
        if not expenses:
            return ExpenseAnalytics(
                total_expenses=0.0,
                category_breakdown={},
                monthly_trend=[],
                top_merchants=[],
                average_daily=0.0,
                highest_expense=0.0,
                expense_count=0
            )
        
        total_expenses = sum(float(expense.amount) for expense in expenses)
        
        # Category breakdown
        category_breakdown = {}
        for expense in expenses:
            category = expense.category
            category_breakdown[category] = category_breakdown.get(category, 0) + float(expense.amount)
        
        # Top merchants
        merchant_totals = {}
        for expense in expenses:
            if expense.merchant:
                merchant_totals[expense.merchant] = merchant_totals.get(expense.merchant, 0) + float(expense.amount)
        
        top_merchants = [
            {"merchant": merchant, "total": total, "count": sum(1 for e in expenses if e.merchant == merchant)}
            for merchant, total in sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        # Normalize month boundaries to compare safely with expense datetimes
        # If expense datetimes are timezone-aware, make month boundaries timezone-aware too
        tzinfo = None
        for e in expenses:
            if getattr(e, 'expense_date', None) is not None and getattr(e.expense_date, 'tzinfo', None):
                tzinfo = e.expense_date.tzinfo
                break

        for i in range(6):
            month_start = datetime.now().replace(day=1) - timedelta(days=30 * i)
            month_end = month_start + timedelta(days=30)
            if tzinfo is not None:
                month_start = month_start.replace(tzinfo=tzinfo)
                month_end = month_end.replace(tzinfo=tzinfo)

            # Guard against None expense_date and ensure safe comparisons
            month_expenses = [e for e in expenses if getattr(e, 'expense_date', None) is not None and month_start <= e.expense_date < month_end]
            monthly_total = sum(float(e.amount) for e in month_expenses)
            monthly_trend.append({
                "month": month_start.strftime("%B %Y"),
                "total": monthly_total,
                "count": len(month_expenses)
            })
        
        return ExpenseAnalytics(
            total_expenses=total_expenses,
            category_breakdown=category_breakdown,
            monthly_trend=list(reversed(monthly_trend)),
            top_merchants=top_merchants,
            average_daily=total_expenses / days if days > 0 else 0,
            highest_expense=max(float(e.amount) for e in expenses) if expenses else 0,
            expense_count=len(expenses)
        )
    
    @staticmethod
    def scan_receipt_ai(receipt_data: str) -> dict:
        """Simulate AI receipt scanning"""
        # Mock AI processing - in real app, this would use OCR and ML
        mock_results = [
            {
                "amount": 23.45,
                "description": "McDonald's Restaurant",
                "category": "Food & Dining",
                "merchant": "McDonald's",
                "location": "Main Street",
                "confidence": 0.95
            },
            {
                "amount": 67.89,
                "description": "Walmart Supercenter",
                "category": "Groceries",
                "merchant": "Walmart",
                "location": "Shopping Center",
                "confidence": 0.92
            },
            {
                "amount": 45.67,
                "description": "Starbucks Coffee",
                "category": "Food & Dining",
                "merchant": "Starbucks",
                "location": "Downtown",
                "confidence": 0.88
            }
        ]
        
        # Return random result to simulate AI processing
        result = random.choice(mock_results)
        result["ai_suggested"] = True
        return result