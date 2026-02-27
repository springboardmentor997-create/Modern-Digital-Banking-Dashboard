from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from app.database import get_db
from app.models.user import User, KYCStatus, UserRole
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.dependencies import require_admin
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter(tags=["admin"])

# Simple in-memory system configuration (for demo / dev)
_system_config = {
    "maintenance_mode": False,
    "max_transaction_limit": 10000.0,
    "kyc_required": True,
}

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None

class SystemConfigRequest(BaseModel):
    maintenance_mode: Optional[bool] = None
    max_transaction_limit: Optional[float] = None
    kyc_required: Optional[bool] = None

class AdminRewardRequest(BaseModel):
    user_id: int
    points: int
    program_name: str
    message: Optional[str] = None

@router.get("/users")
async def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    print(f"DEBUG: Found {len(users)} users in database")
    return [{
        "id": u.id,
        "name": u.name or "N/A",
        "email": u.email,
        "role": u.role.value if u.role else "user",
        "is_active": u.is_active,
        "kyc_status": u.kyc_status.value if u.kyc_status else "unverified",
        "created_at": u.created_at
    } for u in users]

@router.get("/accounts")
async def get_all_accounts(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    accounts = db.query(Account).join(User).all()
    print(f"DEBUG: Found {len(accounts)} accounts in database")
    return [{
        "id": a.id,
        "user_name": a.user.name or "N/A",
        "user_email": a.user.email,
        "account_type": a.account_type.value if a.account_type else "savings",
        "balance": float(a.balance) if a.balance else 0.0,
        "bank_name": a.bank_name or "Asunova Bank",
        "account_number": a.masked_account or "N/A",
        "created_at": a.created_at
    } for a in accounts]

@router.get("/transactions")
async def get_all_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).join(Account).join(User).all()
    return [{
        "id": t.id,
        "user_name": t.account.user.name or "N/A",
        "amount": float(t.amount) if t.amount else 0.0,
        "txn_type": t.txn_type.value if t.txn_type else "debit",
        "description": t.description or "N/A",
        "txn_date": t.txn_date
    } for t in transactions]

@router.get("/system-summary")
async def get_system_summary(db: Session = Depends(get_db)):
    users = db.query(User).all()
    accounts = db.query(Account).all()
    transactions = db.query(Transaction).all()
    
    return {
        "total_users": len(users),
        "active_users": len([u for u in users if u.is_active]),
        "total_accounts": len(accounts),
        "total_transactions": len(transactions),
        "pending_kyc": len([u for u in users if u.kyc_status == KYCStatus.unverified]),
        "verified_kyc": len([u for u in users if u.kyc_status == KYCStatus.verified])
    }

@router.get("/alerts")
async def get_system_alerts(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return [{"id": a.id, "user_id": a.user_id, "user_name": a.user.name if a.user else "System", "type": a.type, "message": a.message, "created_at": a.created_at, "is_read": a.is_read} for a in alerts]

@router.get("/kyc-overview")
async def get_kyc_overview(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    kyc_data = []
    for user in users:
        kyc_data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "kyc_status": user.kyc_status,
            "created_at": user.created_at
        })
    return kyc_data

@router.get("/suspicious-activity")
async def get_suspicious_activity(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    suspicious = []
    
    # Large transactions (>10000)
    large_txns = db.query(Transaction).filter(Transaction.amount > 10000).join(Account).join(User).all()
    for txn in large_txns:
        suspicious.append({
            "type": "large_transaction",
            "user_name": txn.account.user.name,
            "amount": float(txn.amount),
            "description": txn.description,
            "date": txn.txn_date,
            "severity": "high" if txn.amount > 50000 else "medium"
        })
    
    # Inactive users with recent activity
    inactive_users = db.query(User).filter(User.is_active == False).all()
    for user in inactive_users:
        suspicious.append({
            "type": "inactive_user",
            "user_name": user.name,
            "email": user.email,
            "date": user.created_at,
            "severity": "low"
        })
    
    return suspicious

@router.post("/send-email/{user_id}")
async def send_email_to_user(user_id: int, subject: str, message: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Simulate email sending
    print(f"📧 Email sent to {user.email}:")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    
    return {"message": f"Email sent successfully to {user.email}", "status": "sent"}

# Enhanced Admin Endpoints
@router.put("/users/{user_id}")
async def update_user(user_id: int, user_data: UserUpdateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.name:
        user.name = user_data.name
    if user_data.email:
        user.email = user_data.email
    if user_data.phone:
        user.phone = user_data.phone
    if user_data.role:
        user.role = UserRole(user_data.role)
    
    db.commit()
    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has accounts or transactions
    if user.accounts or user.transactions:
        raise HTTPException(status_code=400, detail="Cannot delete user with existing accounts or transactions")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/analytics/users")
async def get_user_analytics(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
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
    
    # Role distribution
    role_stats = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    role_distribution = [{"role": role, "count": count} for role, count in role_stats]
    
    return {
        "monthly_registrations": monthly_registrations[::-1],
        "role_distribution": role_distribution
    }

@router.get("/analytics/transactions")
async def get_transaction_analytics(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Transaction volume trends (last 30 days)
    daily_transactions = []
    for i in range(30):
        date = datetime.now().date() - timedelta(days=i)
        count = db.query(Transaction).filter(
            func.date(Transaction.txn_date) == date
        ).count()
        volume = db.query(func.sum(Transaction.amount)).filter(
            func.date(Transaction.txn_date) == date
        ).scalar() or 0
        daily_transactions.append({
            "date": date.isoformat(),
            "count": count,
            "volume": float(volume)
        })
    
    # Transaction type distribution
    type_stats = db.query(Transaction.txn_type, func.count(Transaction.id)).group_by(Transaction.txn_type).all()
    type_distribution = [{"type": str(txn_type), "count": count} for txn_type, count in type_stats]
    
    return {
        "daily_transactions": daily_transactions[::-1],
        "type_distribution": type_distribution
    }

@router.get("/reports/financial")
async def get_financial_report(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Total system balance
    total_balance = db.query(func.sum(Account.balance)).scalar() or 0
    
    # Average account balance
    avg_balance = db.query(func.avg(Account.balance)).scalar() or 0
    
    # Transaction volume by type
    credit_volume = db.query(func.sum(Transaction.amount)).filter(
        Transaction.txn_type == 'credit'
    ).scalar() or 0
    debit_volume = db.query(func.sum(Transaction.amount)).filter(
        Transaction.txn_type == 'debit'
    ).scalar() or 0
    
    # Top accounts by balance
    top_accounts = db.query(Account, User).join(User).order_by(
        desc(Account.balance)
    ).limit(10).all()
    
    top_accounts_data = [{
        "user_name": user.name,
        "user_email": user.email,
        "account_type": account.account_type,
        "balance": float(account.balance)
    } for account, user in top_accounts]
    
    return {
        "total_balance": float(total_balance),
        "average_balance": float(avg_balance),
        "credit_volume": float(credit_volume),
        "debit_volume": float(debit_volume),
        "top_accounts": top_accounts_data
    }

@router.get("/audit-logs")
async def get_audit_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Recent user activities
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(20).all()
    recent_transactions = db.query(Transaction, User).join(Account).join(User).order_by(
        desc(Transaction.txn_date)
    ).limit(50).all()
    
    user_activities = [{
        "type": "user_registration",
        "user_name": user.name,
        "user_email": user.email,
        "timestamp": user.created_at,
        "details": f"New user registered with role: {user.role}"
    } for user in recent_users]
    
    transaction_activities = [{
        "type": "transaction",
        "user_name": user.name,
        "timestamp": transaction.txn_date,
        "details": f"{transaction.txn_type.upper()} of ₹{transaction.amount} - {transaction.description}"
    } for transaction, user in recent_transactions]
    
    all_activities = user_activities + transaction_activities
    all_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {"activities": all_activities[:100]}

@router.post("/system/maintenance")
async def toggle_maintenance_mode(enabled: bool, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # This would typically update a system configuration table
    return {"message": f"Maintenance mode {'enabled' if enabled else 'disabled'}"}

@router.get("/system/health")
async def get_system_health(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    try:
        # Test database connection
        db.execute("SELECT 1")
        
        # Check for any critical issues
        failed_transactions = db.query(Transaction).filter(
            Transaction.txn_date >= datetime.now() - timedelta(hours=1)
        ).count()
        
        inactive_users_with_recent_activity = db.query(User).filter(
            and_(User.is_active == False, User.created_at >= datetime.now() - timedelta(days=1))
        ).count()
        
        health_status = "healthy"
        issues = []
        
        if failed_transactions > 100:
            health_status = "warning"
            issues.append("High transaction volume detected")
        
        if inactive_users_with_recent_activity > 10:
            health_status = "warning"
            issues.append("Multiple inactive users with recent activity")
        
        return {
            "status": health_status,
            "database_connection": "healthy",
            "issues": issues,
            "last_checked": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "critical",
            "database_connection": "failed",
            "issues": [str(e)],
            "last_checked": datetime.now().isoformat()
        }


# Bulk user operations
@router.post("/users/bulk-activate")
async def bulk_activate_users(user_ids: List[int], db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    for u in users:
        u.is_active = True
    db.commit()
    return {"updated": len(users)}

@router.post("/users/bulk-deactivate")
async def bulk_deactivate_users(user_ids: List[int], db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    for u in users:
        u.is_active = False
    db.commit()
    return {"updated": len(users)}

# Export/Import users (simple CSV export / list import)
@router.get("/export/users")
async def export_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    import io, csv
    users = db.query(User).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "email", "role", "is_active", "created_at"])
    for u in users:
        writer.writerow([u.id, u.name, u.email, u.role, u.is_active, u.created_at])
    csv_data = output.getvalue()
    return {"csv": csv_data}

@router.post("/import/users")
async def import_users(users: List[Dict[str, Any]], db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    created = 0
    for udata in users:
        # basic validation
        if not udata.get("email") or not udata.get("name"):
            continue
        exists = db.query(User).filter(User.email == udata["email"]).first()
        if exists:
            continue
        new_user = User(
            name=udata.get("name"),
            email=udata.get("email"),
            password=udata.get("password", ""),
            role=udata.get("role", "user"),
            is_active=udata.get("is_active", True)
        )
        db.add(new_user)
        created += 1
    db.commit()
    return {"imported": created}

@router.get("/transactions/export")
async def export_transactions_csv(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Export all transactions to CSV format"""
    try:
        transactions = db.query(Transaction).join(Account).join(User).all()
        
        import io, csv
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            "id", "user_id", "user_name", "user_email", "account_id", "account_type",
            "amount", "txn_type", "category", "description", "merchant", "currency",
            "txn_date", "posted_date", "created_at"
        ])
        
        # Write transaction data
        for t in transactions:
            writer.writerow([
                t.id,
                t.user_id,
                t.account.user.name or "N/A",
                t.account.user.email,
                t.account_id,
                t.account.account_type.value if t.account.account_type else "N/A",
                float(t.amount) if t.amount else 0.0,
                t.txn_type.value if t.txn_type else "N/A",
                t.category or "N/A",
                t.description or "N/A",
                t.merchant or "N/A",
                t.currency or "INR",
                t.txn_date.isoformat() if t.txn_date else "",
                t.posted_date.isoformat() if t.posted_date else "",
                t.created_at.isoformat() if t.created_at else ""
            ])
        
        csv_data = output.getvalue()
        output.close()
        
        return {"csv_data": csv_data, "filename": f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    except Exception as e:
        print(f"Error exporting transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to export transactions")

@router.get("/transactions/user/{user_id}/export")
async def export_user_transactions_csv(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Export transactions for a specific user to CSV format"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        transactions = db.query(Transaction).join(Account).filter(Account.user_id == user_id).all()
        
        import io, csv
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            "id", "account_id", "account_type", "amount", "txn_type", "category",
            "description", "merchant", "currency", "txn_date", "posted_date", "created_at"
        ])
        
        # Write transaction data
        for t in transactions:
            writer.writerow([
                t.id,
                t.account_id,
                t.account.account_type.value if t.account.account_type else "N/A",
                float(t.amount) if t.amount else 0.0,
                t.txn_type.value if t.txn_type else "N/A",
                t.category or "N/A",
                t.description or "N/A",
                t.merchant or "N/A",
                t.currency or "INR",
                t.txn_date.isoformat() if t.txn_date else "",
                t.posted_date.isoformat() if t.posted_date else "",
                t.created_at.isoformat() if t.created_at else ""
            ])
        
        csv_data = output.getvalue()
        output.close()
        
        return {
            "csv_data": csv_data, 
            "filename": f"{user.name or 'user'}_{user_id}_transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    except Exception as e:
        print(f"Error exporting user transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to export user transactions")

@router.post("/transactions/import")
async def import_transactions_csv(file_data: Dict[str, Any], db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Import transactions from CSV data"""
    try:
        csv_content = file_data.get("csv_content", "")
        if not csv_content:
            raise HTTPException(status_code=400, detail="No CSV content provided")
        
        import csv, io
        from app.models.transaction import TransactionType
        from app.models.account import AccountType
        
        csv_file = io.StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Validate required fields
                if not all([row.get('user_id'), row.get('amount'), row.get('txn_type')]):
                    errors.append(f"Row {row_num}: Missing required fields (user_id, amount, txn_type)")
                    continue
                
                # Check if user exists
                user_id = int(row['user_id'])
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    errors.append(f"Row {row_num}: User with ID {user_id} not found")
                    continue
                
                # Get or create account for user
                account = db.query(Account).filter(Account.user_id == user_id).first()
                if not account:
                    # Create a default account for the user
                    account = Account(
                        user_id=user_id,
                        account_number=f"ACC{user_id}{datetime.now().strftime('%Y%m%d')}",
                        account_type=AccountType.savings,
                        balance=0.0,
                        is_active=True
                    )
                    db.add(account)
                    db.flush()  # Get the account ID
                
                # Create transaction
                transaction = Transaction(
                    user_id=user_id,
                    account_id=account.id,
                    amount=float(row['amount']),
                    txn_type=TransactionType(row['txn_type'].lower()),
                    category=row.get('category', 'Imported'),
                    description=row.get('description', 'Imported from CSV'),
                    merchant=row.get('merchant'),
                    currency=row.get('currency', 'INR'),
                    txn_date=datetime.now(),
                    posted_date=datetime.now()
                )
                
                db.add(transaction)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        if imported_count > 0:
            db.commit()
        else:
            db.rollback()
        
        return {
            "message": f"Import completed. {imported_count} transactions imported.",
            "imported_count": imported_count,
            "errors": errors[:10],  # Limit errors to first 10
            "total_errors": len(errors)
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error importing transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to import transactions")
@router.post("/system/backup")
async def perform_backup(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Simulated backup operation
    print("🔁 Performing system backup...")
    return {"message": "Backup started", "status": "ok"}

@router.post("/system/clear-cache")
async def clear_system_cache(admin: User = Depends(require_admin)):
    # Simulated cache clear
    print("🧹 Clearing system cache...")
    return {"message": "Cache cleared", "status": "ok"}

# System configuration endpoints
@router.get("/system/config")
async def get_system_config(admin: User = Depends(require_admin)):
    return _system_config

@router.put("/system/config")
async def update_system_config(config: SystemConfigRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Update the in-memory config for demo purposes
    if config.maintenance_mode is not None:
        _system_config["maintenance_mode"] = config.maintenance_mode
    if config.max_transaction_limit is not None:
        _system_config["max_transaction_limit"] = config.max_transaction_limit
    if config.kyc_required is not None:
        _system_config["kyc_required"] = config.kyc_required
    return {"message": "Configuration updated", "config": _system_config}