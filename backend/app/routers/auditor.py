from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from app.database import get_db
from app.models.user import User, KYCStatus, UserRole
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.dependencies import get_current_user, require_auditor
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/auditor", tags=["auditor"])

# Role check is now handled by require_auditor in dependencies.py

# Read-Only User Data
@router.get("/users")
async def get_users_audit(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "phone": u.phone,
        "role": u.role,
        "is_active": u.is_active,
        "kyc_status": u.kyc_status,
        "created_at": u.created_at,
        "account_count": len(u.accounts) if u.accounts else 0,
        "total_balance": sum(float(acc.balance) for acc in u.accounts) if u.accounts else 0.0
    } for u in users]

@router.get("/users/{user_id}")
async def get_user_detail_audit(user_id: int, db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "kyc_status": user.kyc_status,
        "created_at": user.created_at,
        "accounts": [{
            "id": acc.id,
            "account_type": acc.account_type,
            "balance": float(acc.balance),
            "bank_name": acc.bank_name,
            "created_at": acc.created_at
        } for acc in user.accounts],
        "recent_transactions": [{
            "id": txn.id,
            "amount": float(txn.amount),
            "txn_type": txn.txn_type,
            "description": txn.description,
            "txn_date": txn.txn_date
        } for txn in user.transactions[-10:]]  # Last 10 transactions
    }

# Read-Only Account Data
@router.get("/accounts")
async def get_accounts_audit(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    accounts = db.query(Account).join(User).all()
    return [{
        "id": a.id,
        "user_id": a.user_id,
        "user_name": a.user.name,
        "user_email": a.user.email,
        "account_type": a.account_type,
        "balance": float(a.balance),
        "bank_name": a.bank_name,
        "created_at": a.created_at,
        "transaction_count": len(a.transactions) if a.transactions else 0
    } for a in accounts]

@router.get("/accounts/{account_id}")
async def get_account_detail_audit(account_id: int, db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {
        "id": account.id,
        "user_id": account.user_id,
        "user_name": account.user.name,
        "user_email": account.user.email,
        "account_type": account.account_type,
        "balance": float(account.balance),
        "bank_name": account.bank_name,
        "created_at": account.created_at,
        "transactions": [{
            "id": txn.id,
            "amount": float(txn.amount),
            "txn_type": txn.txn_type,
            "description": txn.description,
            "txn_date": txn.txn_date
        } for txn in account.transactions]
    }

# Read-Only Transaction Data
@router.get("/transactions")
async def get_transactions_audit(
    db: Session = Depends(get_db), 
    auditor: User = Depends(require_auditor),
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    user_id: Optional[int] = Query(None),
    account_id: Optional[int] = Query(None),
    txn_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    query = db.query(Transaction).join(Account).join(User)
    
    # Apply filters
    if user_id:
        query = query.filter(User.id == user_id)
    if account_id:
        query = query.filter(Account.id == account_id)
    if txn_type:
        query = query.filter(Transaction.txn_type == txn_type)
    if start_date:
        query = query.filter(Transaction.txn_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.txn_date <= datetime.fromisoformat(end_date))
    
    transactions = query.order_by(desc(Transaction.txn_date)).offset(offset).limit(limit).all()
    total_count = query.count()
    
    return {
        "transactions": [{
            "id": t.id,
            "user_id": t.account.user_id,
            "user_name": t.account.user.name,
            "user_email": t.account.user.email,
            "account_id": t.account_id,
            "account_type": t.account.account_type,
            "amount": float(t.amount),
            "txn_type": t.txn_type,
            "category": t.category,
            "description": t.description,
            "merchant": t.merchant,
            "txn_date": t.txn_date,
            "created_at": t.created_at
        } for t in transactions],
        "total_count": total_count,
        "limit": limit,
        "offset": offset
    }

# System Logs and Alerts
@router.get("/system-logs")
async def get_system_logs_audit(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    # Recent user activities
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(50).all()
    recent_transactions = db.query(Transaction, User).join(Account).join(User).order_by(
        desc(Transaction.txn_date)
    ).limit(100).all()
    
    user_activities = [{
        "type": "user_registration",
        "user_id": user.id,
        "user_name": user.name,
        "user_email": user.email,
        "timestamp": user.created_at,
        "details": f"New user registered with role: {user.role}",
        "metadata": {
            "role": user.role,
            "kyc_status": user.kyc_status,
            "is_active": user.is_active
        }
    } for user in recent_users]
    
    transaction_activities = [{
        "type": "transaction",
        "user_id": user.id,
        "user_name": user.name,
        "timestamp": transaction.txn_date,
        "details": f"{transaction.txn_type.upper()} of ₹{transaction.amount} - {transaction.description}",
        "metadata": {
            "transaction_id": transaction.id,
            "amount": float(transaction.amount),
            "txn_type": transaction.txn_type,
            "category": transaction.category
        }
    } for transaction, user in recent_transactions]
    
    all_activities = user_activities + transaction_activities
    all_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {"activities": all_activities[:200]}  # Return last 200 activities

@router.get("/alerts")
async def get_alerts_audit(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    alerts = db.query(Alert).join(User).order_by(desc(Alert.created_at)).all()
    return [{
        "id": a.id,
        "user_id": a.user_id,
        "user_name": a.user.name,
        "user_email": a.user.email,
        "type": a.type,
        "message": a.message,
        "created_at": a.created_at,
        "is_read": a.is_read
    } for a in alerts]

# Compliance Reports
@router.get("/compliance-summary")
async def get_compliance_summary(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    # User compliance metrics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_kyc = db.query(User).filter(User.kyc_status == KYCStatus.verified).count()
    pending_kyc = db.query(User).filter(User.kyc_status == KYCStatus.unverified).count()
    
    # Account metrics
    total_accounts = db.query(Account).count()
    total_balance = db.query(func.sum(Account.balance)).scalar() or 0
    
    # Transaction metrics
    total_transactions = db.query(Transaction).count()
    today_transactions = db.query(Transaction).filter(
        func.date(Transaction.txn_date) == datetime.now().date()
    ).count()
    
    # Large transactions (potential compliance issues)
    large_transactions = db.query(Transaction).filter(Transaction.amount > 10000).count()
    
    # Role distribution
    role_stats = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    
    return {
        "user_metrics": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "verified_kyc": verified_kyc,
            "pending_kyc": pending_kyc,
            "kyc_compliance_rate": round((verified_kyc / total_users * 100), 2) if total_users > 0 else 0
        },
        "account_metrics": {
            "total_accounts": total_accounts,
            "total_balance": float(total_balance),
            "average_balance": float(total_balance / total_accounts) if total_accounts > 0 else 0
        },
        "transaction_metrics": {
            "total_transactions": total_transactions,
            "today_transactions": today_transactions,
            "large_transactions": large_transactions,
            "large_transaction_rate": round((large_transactions / total_transactions * 100), 2) if total_transactions > 0 else 0
        },
        "role_distribution": [{
            "role": role,
            "count": count,
            "percentage": round((count / total_users * 100), 2) if total_users > 0 else 0
        } for role, count in role_stats],
        "generated_at": datetime.now().isoformat()
    }

@router.get("/transaction-patterns")
async def get_transaction_patterns(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    # Daily transaction patterns (last 30 days)
    daily_patterns = []
    for i in range(30):
        date = datetime.now().date() - timedelta(days=i)
        count = db.query(Transaction).filter(func.date(Transaction.txn_date) == date).count()
        volume = db.query(func.sum(Transaction.amount)).filter(func.date(Transaction.txn_date) == date).scalar() or 0
        daily_patterns.append({
            "date": date.isoformat(),
            "transaction_count": count,
            "total_volume": float(volume)
        })
    
    # Transaction type distribution
    type_stats = db.query(Transaction.txn_type, func.count(Transaction.id), func.sum(Transaction.amount)).group_by(Transaction.txn_type).all()
    type_distribution = [{
        "type": str(txn_type),
        "count": count,
        "total_amount": float(total_amount or 0)
    } for txn_type, count, total_amount in type_stats]
    
    # Category analysis
    category_stats = db.query(Transaction.category, func.count(Transaction.id), func.sum(Transaction.amount)).filter(
        Transaction.category.isnot(None)
    ).group_by(Transaction.category).all()
    category_distribution = [{
        "category": category,
        "count": count,
        "total_amount": float(total_amount or 0)
    } for category, count, total_amount in category_stats]
    
    return {
        "daily_patterns": daily_patterns[::-1],  # Reverse to show oldest first
        "type_distribution": type_distribution,
        "category_distribution": category_distribution
    }

@router.get("/user-activity-report")
async def get_user_activity_report(db: Session = Depends(get_db), auditor: User = Depends(require_auditor)):
    # User registration trends (last 12 months)
    monthly_registrations = []
    for i in range(12):
        start_date = datetime.now() - timedelta(days=30*(i+1))
        end_date = datetime.now() - timedelta(days=30*i)
        count = db.query(User).filter(
            and_(User.created_at >= start_date, User.created_at < end_date)
        ).count()
        monthly_registrations.append({
            "month": start_date.strftime("%Y-%m"),
            "registrations": count
        })
    
    # Most active users (by transaction count)
    active_users = db.query(
        User.id, User.name, User.email, func.count(Transaction.id).label('txn_count')
    ).join(Account).join(Transaction).group_by(User.id, User.name, User.email).order_by(
        desc('txn_count')
    ).limit(20).all()
    
    active_users_data = [{
        "user_id": user_id,
        "name": name,
        "email": email,
        "transaction_count": txn_count
    } for user_id, name, email, txn_count in active_users]
    
    return {
        "monthly_registrations": monthly_registrations[::-1],
        "most_active_users": active_users_data
    }