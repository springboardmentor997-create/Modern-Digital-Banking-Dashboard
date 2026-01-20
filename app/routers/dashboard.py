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

# Removed - now using centralized require_support_or_admin from dependencies

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

# Admin Endpoints
@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), admin_user: User = Depends(require_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active, "kyc_status": u.kyc_status, "created_at": u.created_at} for u in users]

@router.put("/admin/users/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db), admin_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User activated successfully"}

@router.put("/admin/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db), admin_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated successfully"}

# Removed duplicate endpoint - using the more complete version from admin.py

# Auditor Endpoints
@router.get("/auditor/users")
def get_users_audit(db: Session = Depends(get_db), auditor_user: User = Depends(require_auditor_or_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "is_active": u.is_active, "kyc_status": u.kyc_status} for u in users]

@router.get("/auditor/accounts")
def get_accounts_audit(db: Session = Depends(get_db), auditor_user: User = Depends(require_auditor_or_admin)):
    return db.query(Account).all()

@router.get("/auditor/transactions")
def get_transactions_audit(db: Session = Depends(get_db), auditor_user: User = Depends(require_auditor_or_admin)):
    return db.query(Transaction).all()

# Support Endpoints
@router.get("/support/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db), support_user: User = Depends(require_support_or_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "role": user.role, "is_active": user.is_active, "kyc_status": user.kyc_status, "created_at": user.created_at}

@router.get("/support/users/{user_id}/accounts")
def get_user_accounts(user_id: int, db: Session = Depends(get_db), support_user: User = Depends(require_support_or_admin)):
    return db.query(Account).filter(Account.user_id == user_id).all()

@router.get("/support/users/{user_id}/transactions")
def get_user_transactions(user_id: int, db: Session = Depends(get_db), support_user: User = Depends(require_support_or_admin)):
    return db.query(Transaction).filter(Transaction.user_id == user_id).all()