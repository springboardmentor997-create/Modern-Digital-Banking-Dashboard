from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.account import Account, AccountType
from pydantic import BaseModel, Field
import random
from typing import List

router = APIRouter()

# 1. Define the Schema (Strictly matches Frontend keys)
class AccountCreate(BaseModel):
    name: str
    account_type: str
    bank_name: str
    balance: float = 0.0

@router.get("/")
def get_accounts(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id
    ).all()
    
    if not accounts:
        # Auto-create a default account if the list is empty
        masked_account = f"****{random.randint(1000, 9999)}"
        default_account = Account(
            user_id=current_user.id,
            name="Main Checking",
            account_type=AccountType.checking,
            bank_name="Demo Bank",
            masked_account=masked_account,
            balance=25000.00
        )
        db.add(default_account)
        db.commit()
        db.refresh(default_account)
        accounts = [default_account]
    
    return [
        {
            "id": acc.id,
            "name": acc.name,
            "account_type": acc.account_type.value if hasattr(acc.account_type, 'value') else str(acc.account_type),
            "balance": float(acc.balance),
            "masked_account": acc.masked_account,
            "bank_name": acc.bank_name,
            "currency": acc.currency,
            "is_active": True,
            "created_at": acc.created_at.isoformat() if acc.created_at else None
        } for acc in accounts
    ]

@router.post("/")
def create_account(account_data: AccountCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Note: Variable name changed to 'account_data' to avoid confusion
    masked_account = f"****{random.randint(1000, 9999)}"
    
    # Verify AccountType exists in the Enum
    try:
        # Normalize aliases: accept 'credit' as alias for 'credit_card'
        raw_type = account_data.account_type.lower()
        if raw_type == 'credit':
            raw_type = 'credit_card'
        # Convert string to enum
        validated_type = AccountType(raw_type)
    except ValueError:
        valid_options = ', '.join([e.value for e in AccountType])
        raise HTTPException(
            status_code=400,
            detail=f"Invalid type. Use one of: {valid_options}"
        )

    # ✅ Use only the attributes defined in AccountCreate class
    db_account = Account(
        user_id=current_user.id,
        name=account_data.name,           # Correct attribute
        account_type=validated_type,       # Correct attribute
        bank_name=account_data.bank_name, # Correct attribute
        masked_account=masked_account,
        balance=account_data.balance      # Correct attribute
    )
    
    try:
        db.add(db_account)
        db.commit()
        db.refresh(db_account)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "id": db_account.id,
        "name": db_account.name,
        "account_type": db_account.account_type.value,
        "balance": float(db_account.balance),
        "masked_account": db_account.masked_account,
        "bank_name": db_account.bank_name,
        "currency": db_account.currency,
        "is_active": True,
        "created_at": db_account.created_at.isoformat() if db_account.created_at else None
    }

@router.delete("/{account_id}")
def delete_account(account_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.transaction import Transaction
    
    # Find the account
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )
    
    # Check transaction count for informational purposes
    transaction_count = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).count()
    
    try:
        # Delete the account - transactions will cascade delete due to ondelete="CASCADE"
        db.delete(account)
        db.commit()
        
        message = "Account deleted successfully"
        if transaction_count > 0:
            message += f" (including {transaction_count} associated transaction(s))"
        
        return {"message": message, "transactions_deleted": transaction_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete account: {str(e)}"
        )
