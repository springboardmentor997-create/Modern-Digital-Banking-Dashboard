from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.account import Account
from app.models.transaction import Transaction, TxnType
from pydantic import BaseModel

router = APIRouter()

class TransactionCreate(BaseModel):
    account_id: int
    description: str
    amount: float
    txn_type: str  # 'debit' or 'credit'
    category: str = None
    merchant: str = None

@router.get("/")
def get_transactions(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.txn_date.desc()).all()
    
    return [
        {
            "id": txn.id,
            "description": txn.description,
            "amount": float(txn.amount),
            "txn_type": txn.txn_type.value,
            "transaction_type": txn.txn_type.value,  # For backward compatibility
            "type": txn.txn_type.value,  # For backward compatibility
            "category": txn.category,
            "merchant": txn.merchant,
            "date": txn.txn_date.isoformat(),
            "account_id": txn.account_id
        } for txn in transactions
    ]

@router.post("/")
def create_transaction(transaction: TransactionCreate, current_user = Depends(get_current_user)):
    from app.database import SessionLocal
    db = SessionLocal()
    
    try:
        account = db.query(Account).filter(
            Account.id == transaction.account_id,
            Account.user_id == current_user.id
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        if transaction.txn_type == 'debit' and float(account.balance) < transaction.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        txn_type_enum = TxnType.debit if transaction.txn_type == 'debit' else TxnType.credit
        
        db_transaction = Transaction(
            user_id=current_user.id,
            account_id=transaction.account_id,
            description=transaction.description,
            amount=transaction.amount,
            txn_type=txn_type_enum,
            category=transaction.category,
            merchant=transaction.merchant or ""
        )
        
        if transaction.txn_type == 'credit':
            account.balance = float(account.balance) + transaction.amount
        else:
            account.balance = float(account.balance) - transaction.amount
        
        db.add(db_transaction)
        db.commit()
        
        result = {
            "id": db_transaction.id,
            "description": db_transaction.description,
            "amount": float(db_transaction.amount),
            "txn_type": db_transaction.txn_type.value,
            "transaction_type": db_transaction.txn_type.value,
            "type": db_transaction.txn_type.value,
            "category": db_transaction.category,
            "merchant": db_transaction.merchant,
            "date": db_transaction.txn_date.isoformat(),
            "account_id": db_transaction.account_id
        }
        
        return result
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {str(e)}")
    finally:
        db.close()