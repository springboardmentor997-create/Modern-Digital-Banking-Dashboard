from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
from app.models.transaction import Transaction
from app.models.account import Account
from app.transactions.schemas import TransactionCreate, TransactionUpdate
from typing import List, Optional
from decimal import Decimal
import uuid
from datetime import datetime

class TransactionService:
    
    @staticmethod
    def create_transaction(db: Session, transaction_data: TransactionCreate, user_id: int) -> Transaction:
        # Generate unique reference number
        reference_number = f"TXN{uuid.uuid4().hex[:8].upper()}"
        
        db_transaction = Transaction(
            user_id=user_id,
            from_account_id=transaction_data.from_account_id,
            to_account_id=transaction_data.to_account_id,
            transaction_type=transaction_data.transaction_type,
            amount=transaction_data.amount,
            currency=transaction_data.currency or "USD",
            description=transaction_data.description,
            reference_number=reference_number,
            status="completed"
        )
        
        db.add(db_transaction)
        
        # Update account balances
        if transaction_data.from_account_id:
            from_account = db.query(Account).filter(Account.id == transaction_data.from_account_id).first()
            if from_account:
                from_account.balance -= transaction_data.amount
        
        if transaction_data.to_account_id:
            to_account = db.query(Account).filter(Account.id == transaction_data.to_account_id).first()
            if to_account:
                to_account.balance += transaction_data.amount
        
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    
    @staticmethod
    def get_transactions(db: Session, user_id: int, limit: int = 50) -> List[Transaction]:
        return db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(desc(Transaction.created_at)).limit(limit).all()
    
    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: int, user_id: int) -> Optional[Transaction]:
        return db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id
        ).first()
    
    @staticmethod
    def get_transactions_by_account(db: Session, account_id: int, user_id: int) -> List[Transaction]:
        return db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                (Transaction.from_account_id == account_id) | (Transaction.to_account_id == account_id)
            )
        ).order_by(desc(Transaction.created_at)).all()
    
    @staticmethod
    def update_transaction(db: Session, transaction_id: int, transaction_data: TransactionUpdate, user_id: int) -> Optional[Transaction]:
        transaction = TransactionService.get_transaction_by_id(db, transaction_id, user_id)
        if not transaction:
            return None
        
        for field, value in transaction_data.dict(exclude_unset=True).items():
            setattr(transaction, field, value)
        
        db.commit()
        db.refresh(transaction)
        return transaction
    
    @staticmethod
    def delete_transaction(db: Session, transaction_id: int, user_id: int) -> bool:
        transaction = TransactionService.get_transaction_by_id(db, transaction_id, user_id)
        if not transaction:
            return False
        
        db.delete(transaction)
        db.commit()
        return True
    
    @staticmethod
    def get_transaction_summary(db: Session, user_id: int):
        """Get transaction summary for dashboard"""
        total_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "deposit"
        ).scalar() or 0
        
        total_expenses = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "withdrawal"
        ).scalar() or 0
        
        transaction_count = db.query(func.count(Transaction.id)).filter(
            Transaction.user_id == user_id
        ).scalar() or 0
        
        return {
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "net_balance": float(total_income) - float(total_expenses),
            "transaction_count": transaction_count
        }