from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User, UserRole
from app.models.alert import Alert
from datetime import date

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

# Import centralized role checks which already include admin access
from app.dependencies import require_auditor as require_auditor_or_admin, require_support as require_support_or_admin

@router.get("/dashboard-stats")
def get_dashboard_stats(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get real data from database
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    total_balance = sum(float(acc.balance) for acc in accounts)
    
    # Get transactions for current month
    today = date.today()
    
    income_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.txn_type.in_(['credit']),
        Transaction.txn_date >= date(today.year, today.month, 1)
    ).all()
    
    expense_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.txn_type.in_(['debit']),
        Transaction.txn_date >= date(today.year, today.month, 1)
    ).all()
    
    income_this_month = sum(float(txn.amount) for txn in income_transactions)
    expenses_this_month = sum(float(txn.amount) for txn in expense_transactions)
    
    # Get active budgets
    active_budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == today.month,
        Budget.year == today.year
    ).count()
    
    return {
        "total_accounts": len(accounts),
        "total_balance": total_balance,
        "income_this_month": income_this_month,
        "expenses_this_month": expenses_this_month,
        "net_this_month": income_this_month - expenses_this_month,
        "active_budgets": active_budgets
    }

# All Auditor and Support endpoints have been moved to their respective routers
# (auditor.py and support.py) to avoid conflicts and improve maintainability.
