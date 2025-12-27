from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.transactions.schemas import TransactionCreate
from datetime import datetime
import csv
from io import StringIO
from decimal import Decimal


from app.models.account import Account

class TransactionService:
    @staticmethod
    def create_transaction(db: Session, account_id: int, transaction_data: TransactionCreate):
        # Create transaction and update account balance atomically
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

        try:
            acct = db.query(Account).filter(Account.id == account_id).first()
            if acct:
                # Normalize to Decimal
                curr_balance = acct.balance if acct.balance is not None else Decimal("0")
                amt = transaction_data.amount if isinstance(transaction_data.amount, Decimal) else Decimal(str(transaction_data.amount))

                # Diagnostic logging: show intended update
                print(f"[TXN] Account {acct.id} balance before: {curr_balance} | txn_type={transaction_data.txn_type} amount={amt}")

                if transaction_data.txn_type == "debit":
                    acct.balance = curr_balance - amt
                else:
                    # treat any non-debit as credit
                    acct.balance = curr_balance + amt

                print(f"[TXN] Account {acct.id} balance after: {acct.balance}")

                db.add(acct)

            db.add(new_transaction)
            db.commit()
            db.refresh(new_transaction)

            # refresh account if present
            if acct:
                try:
                    db.refresh(acct)
                except Exception:
                    pass

            return new_transaction
        except Exception:
            db.rollback()
            raise
    
    @staticmethod
    def get_account_transactions(db: Session, account_id: int, skip: int = 0, limit: int = 100):
        return db.query(Transaction).filter(
            Transaction.account_id == account_id
        ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_user_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
        """Return transactions for all accounts belonging to given user_id."""
        # join with Account via relationship or account_id -> accounts table
        from app.models.account import Account

        return db.query(Transaction).join(Account, Transaction.account_id == Account.id).filter(
            Account.user_id == user_id
        ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
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
