from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.transactions.schemas import TransactionCreate
from datetime import datetime
import csv
from io import StringIO

class TransactionService:
    @staticmethod
    def create_transaction(db: Session, account_id: int, transaction_data: TransactionCreate):
        new_transaction = Transaction(
            account_id=account_id,
            description=transaction_data.description,
            category=transaction_data.category,
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            txn_type=transaction_data.txn_type,
            merchant=transaction_data.merchant,
            txn_date=transaction_data.txn_date
        )
        
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        
        return new_transaction
    
    @staticmethod
    def get_account_transactions(db: Session, account_id: int, skip: int = 0, limit: int = 100):
        return db.query(Transaction).filter(
            Transaction.account_id == account_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: int, account_id: int):
        return db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.account_id == account_id
        ).first()
    
    @staticmethod
    def import_csv(db: Session, account_id: int, csv_content: str):
        """Import transactions from CSV content"""
        transactions = []
        csv_reader = csv.DictReader(StringIO(csv_content))
        
        required_fields = ['amount', 'txn_type', 'txn_date']
        
        for row in csv_reader:
            # Validate required fields
            if not all(field in row for field in required_fields):
                continue
            
            try:
                # Parse transaction date
                txn_date = datetime.fromisoformat(row['txn_date'].replace('Z', '+00:00'))
                
                transaction = Transaction(
                    account_id=account_id,
                    description=row.get('description'),
                    category=row.get('category'),
                    amount=float(row['amount']),
                    currency=row.get('currency', 'USD'),
                    txn_type=row['txn_type'],
                    merchant=row.get('merchant'),
                    txn_date=txn_date,
                    posted_date=datetime.fromisoformat(row['posted_date'].replace('Z', '+00:00')) if row.get('posted_date') else None
                )
                
                db.add(transaction)
                transactions.append(transaction)
            except (ValueError, KeyError) as e:
                # Skip malformed rows
                continue
        
        db.commit()
        return transactions
