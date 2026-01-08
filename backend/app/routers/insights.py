from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Transaction, Budget
from app.dependencies import get_current_user

router = APIRouter(tags=["Insights"])

@router.get("/")
def get_insights(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get real transactions for the current user
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    # Calculate income and expenses
    income = sum(float(t.amount) for t in transactions if t.txn_type == 'credit')
    expenses = sum(float(t.amount) for t in transactions if t.txn_type == 'debit')
    net_savings = income - expenses
    savings_rate = (net_savings / income * 100) if income > 0 else 0
    
    # Get top category
    category_totals = {}
    for t in transactions:
        if t.txn_type == 'debit' and t.category:
            category_totals[t.category] = category_totals.get(t.category, 0) + float(t.amount)
    
    top_category = max(category_totals.items(), key=lambda x: x[1])[0] if category_totals else "None"
    
    return {
        "income": income,
        "expenses": expenses,
        "net_flow": net_savings,
        "savings_rate": savings_rate,
        "top_category": top_category,
        "transactions_count": len(transactions)
    }

@router.get("/spending")
def get_spending_analysis(period: str = "month", current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get transactions for the current user
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.txn_type == 'debit'
    ).all()
    
    total_spent = sum(float(t.amount) for t in transactions)
    
    # Get top merchants
    merchant_totals = {}
    for t in transactions:
        if t.merchant:
            merchant_totals[t.merchant] = merchant_totals.get(t.merchant, 0) + float(t.amount)
    
    top_merchants = [
        {"merchant": merchant, "total_spent": amount, "transaction_count": sum(1 for t in transactions if t.merchant == merchant)}
        for merchant, amount in sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Calculate daily burn rate
    days_in_period = 30 if period == "month" else 7
    daily_burn_rate = total_spent / days_in_period if days_in_period > 0 else 0
    projected_monthly_spend = daily_burn_rate * 30
    
    return {
        "period": period,
        "total_spent": total_spent,
        "daily_burn_rate": daily_burn_rate,
        "projected_monthly_spend": projected_monthly_spend,
        "top_merchants": top_merchants
    }

@router.get("/categories")
def get_category_breakdown(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {"category": "Dining", "amount": 450.0, "percentage": 25.0},
        {"category": "Groceries", "amount": 380.0, "percentage": 21.1},
        {"category": "Gas", "amount": 240.0, "percentage": 13.3},
        {"category": "Shopping", "amount": 320.0, "percentage": 17.8},
        {"category": "Entertainment", "amount": 210.0, "percentage": 11.7},
        {"category": "Utilities", "amount": 200.0, "percentage": 11.1}
    ]

@router.get("/trends")
def get_monthly_trends(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {"month": "August 2024", "income": 5000.0, "expenses": 3200.0, "savings": 1800.0},
        {"month": "September 2024", "income": 5200.0, "expenses": 3400.0, "savings": 1800.0},
        {"month": "October 2024", "income": 4800.0, "expenses": 3600.0, "savings": 1200.0},
        {"month": "November 2024", "income": 5100.0, "expenses": 3300.0, "savings": 1800.0},
        {"month": "December 2024", "income": 5300.0, "expenses": 3800.0, "savings": 1500.0},
        {"month": "January 2025", "income": 5000.0, "expenses": 3500.0, "savings": 1500.0}
    ]

@router.get("/budgets")
def get_budget_insights(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "total_budgets": 5,
        "over_budget_count": 1,
        "average_utilization": 75.5,
        "highest_category": "Dining"
    }

@router.get("/cash-flow")
def get_cash_flow(
    period: str = "monthly",
    db: Session = Depends(get_db)
):
    # Mock data for demo
    return {
        "period": period,
        "income": 5000.0,
        "expenses": 3500.0,
        "net_flow": 1500.0,
        "savings_rate": 30.0
    }

@router.get("/top-merchants")
def get_top_merchants(limit: int = 5):
    # Mock data for demo
    return [
        {"merchant": "Amazon", "total_spent": 450.0, "transaction_count": 8},
        {"merchant": "Walmart", "total_spent": 320.0, "transaction_count": 12},
        {"merchant": "Starbucks", "total_spent": 180.0, "transaction_count": 15},
        {"merchant": "Shell", "total_spent": 240.0, "transaction_count": 6},
        {"merchant": "Target", "total_spent": 290.0, "transaction_count": 9}
    ]

@router.get("/burn-rate")
def get_burn_rate():
    # Mock data for demo
    return {
        "current_month_spent": 2100.0,
        "days_passed": 15,
        "daily_burn_rate": 140.0,
        "projected_monthly_spend": 4200.0
    }

@router.get("/category-breakdown")
def get_category_breakdown():
    # Mock data for demo
    return [
        {"category": "Dining", "amount": 450.0, "percentage": 25.0},
        {"category": "Groceries", "amount": 380.0, "percentage": 21.1},
        {"category": "Gas", "amount": 240.0, "percentage": 13.3},
        {"category": "Shopping", "amount": 320.0, "percentage": 17.8},
        {"category": "Entertainment", "amount": 210.0, "percentage": 11.7},
        {"category": "Utilities", "amount": 200.0, "percentage": 11.1}
    ]

@router.get("/savings-trend")
def get_savings_trend(months: int = 6):
    # Mock data for demo
    return [
        {"month": "August 2024", "income": 5000.0, "expenses": 3200.0, "savings": 1800.0},
        {"month": "September 2024", "income": 5200.0, "expenses": 3400.0, "savings": 1800.0},
        {"month": "October 2024", "income": 4800.0, "expenses": 3600.0, "savings": 1200.0},
        {"month": "November 2024", "income": 5100.0, "expenses": 3300.0, "savings": 1800.0},
        {"month": "December 2024", "income": 5300.0, "expenses": 3800.0, "savings": 1500.0},
        {"month": "January 2025", "income": 5000.0, "expenses": 3500.0, "savings": 1500.0}
    ]