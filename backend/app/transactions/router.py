from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Union, Any
from decimal import Decimal
from datetime import datetime
from app.utils.currency import convert_currency, get_supported_currencies
import uuid
from app.database import get_db
from app.models.transaction import Transaction
from app.models.account import Account


from app.transactions.schemas import TransactionCreate, TransactionResponse
from app.transactions.csv_import import import_transactions_from_csv
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=Union[TransactionResponse, Any])
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        # 1. Verify account belongs to the logged-in user
        account = db.query(Account).filter(
            Account.id == transaction.account_id, 
            Account.user_id == current_user.id
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found or access denied")
        
        # Check for sufficient balance on debit transactions
        transaction_amount = Decimal(str(transaction.amount))
        # if transaction.txn_type == "debit" and Decimal(str(account.balance)) < transaction_amount:
        #     raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # 2. Create transaction record
        db_transaction = Transaction(
            user_id=current_user.id,
            account_id=transaction.account_id,
            amount=transaction.amount,
            txn_type=transaction.txn_type,
            description=transaction.description,
            category=transaction.category,
            merchant=transaction.merchant
        )

        # Handle custom dates
        if transaction.date:
            try:
                db_transaction.txn_date = datetime.fromisoformat(transaction.date.replace('Z', '+00:00'))
            except Exception:
                pass

        db.add(db_transaction)
        db.flush()

        # 3. Update account balance
        if transaction.txn_type == "credit":
            account.balance = Decimal(str(account.balance)) + transaction_amount
        else:
            account.balance = Decimal(str(account.balance)) - transaction_amount

        db.commit()
        db.refresh(db_transaction)
        
        return TransactionResponse.from_orm(db_transaction)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Transaction creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {str(e)}")

@router.post("", response_model=Union[TransactionResponse, Any])
def create_transaction_no_slash(transaction: TransactionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Duplicate endpoint without trailing slash for compatibility"""
    return create_transaction(transaction, db, current_user)

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    account_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Join with Account to ensure we only get transactions belonging to the user
        query = db.query(Transaction).join(Account).filter(Account.user_id == current_user.id)
        
        if account_id:
            query = query.filter(Transaction.account_id == account_id)
        if category:
            query = query.filter(Transaction.category.ilike(f"%{category}%"))
        if transaction_type:
            query = query.filter(Transaction.txn_type == transaction_type)
        
        return query.order_by(Transaction.txn_date.desc()).offset(offset).limit(limit).all()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transactions: {str(e)}")

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        transaction = db.query(Transaction).join(Account).filter(
            Transaction.id == transaction_id,
            Account.user_id == current_user.id
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transaction: {str(e)}")

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int, 
    transaction_data: TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    try:
        db.begin()
        
        transaction = db.query(Transaction).join(Account).filter(
            Transaction.id == transaction_id,
            Account.user_id == current_user.id
        ).first()
        
        if not transaction:
            db.rollback()
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Reverse old balance impact
        old_account = db.query(Account).filter(Account.id == transaction.account_id).first()
        if old_account:
            old_amount = Decimal(str(transaction.amount))
            current_balance = Decimal(str(old_account.balance))
            if transaction.txn_type == "credit":
                old_account.balance = current_balance - old_amount
            else:
                old_account.balance = current_balance + old_amount
                
        # Apply new values
        transaction.amount = transaction_data.amount
        transaction.txn_type = transaction_data.txn_type
        transaction.description = transaction_data.description
        transaction.category = transaction_data.category
        if hasattr(transaction_data, 'account_id'):
            transaction.account_id = transaction_data.account_id
            
        # Apply new balance impact
        new_account = db.query(Account).filter(Account.id == transaction.account_id).first()
        if new_account:
            new_amount = Decimal(str(transaction.amount))
            current_balance = Decimal(str(new_account.balance))
            if transaction.txn_type == "credit":
                new_account.balance = current_balance + new_amount
            else:
                new_account.balance = current_balance - new_amount
        
        db.commit()
        db.refresh(transaction)
        return transaction
        
    except HTTPException as http_exc:
        try:
            db.rollback()
        except:
            pass
        raise http_exc
    except Exception as e:
        try:
            db.rollback()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to update transaction: {str(e)}")

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/{transaction_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    transaction = db.query(Transaction).join(Account).filter(
        Transaction.id == transaction_id,
        Account.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Reverse balance effect
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if account:
        transaction_amount = Decimal(str(transaction.amount))
        current_balance = Decimal(str(account.balance))
        if transaction.txn_type == "credit":
            account.balance = current_balance - transaction_amount
        else:
            account.balance = current_balance + transaction_amount
    
    db.delete(transaction)
    db.commit()
    return None

@router.post("/import-csv")
def import_csv(
    file: UploadFile = File(...), 
    account_id: int = Query(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    try:
        account = db.query(Account).filter(
            Account.id == account_id, 
            Account.user_id == current_user.id
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        return import_transactions_from_csv(file, account_id, db)
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import CSV: {str(e)}")











@router.get("/currencies")
def get_currencies():
    """Get supported currencies for conversion"""
    return get_supported_currencies()

@router.get("/convert-currency")
def convert_amount(from_currency: str, to_currency: str, amount: float):
    """Convert amount between currencies"""
    try:
        converted = convert_currency(Decimal(str(amount)), from_currency, to_currency)
        return {
            "original_amount": amount,
            "converted_amount": float(converted),
            "from_currency": from_currency,
            "to_currency": to_currency
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))