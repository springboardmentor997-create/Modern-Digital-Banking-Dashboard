import csv
import io
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.account import Account


def import_transactions_from_csv(file: UploadFile, account_id: int, db: Session):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = file.file.read()
    csv_data = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    
    transactions_created = 0
    errors = []
    
    for row_num, row in enumerate(reader, start=2):
        try:
            # Expected CSV columns: date, amount, type, description, category
            transaction_date = datetime.strptime(row['date'], '%Y-%m-%d')
            amount = Decimal(row['amount'])
            transaction_type = row['type'].lower()
            
            if transaction_type not in ['credit', 'debit']:
                errors.append(f"Row {row_num}: Invalid transaction type '{transaction_type}'")
                continue
            
            # Get account and user_id
            account = db.query(Account).filter(Account.id == account_id).first()
            if not account:
                raise HTTPException(status_code=404, detail="Account not found")
            
            transaction = Transaction(
                user_id=account.user_id,
                account_id=account_id,
                amount=amount,
                txn_type=transaction_type,
                description=row.get('description', ''),
                category=row.get('category', ''),
                merchant=row.get('merchant', ''),
                txn_date=transaction_date
            )
            
            db.add(transaction)
            
            # Update account balance
            if transaction_type == "credit":
                account.balance = Decimal(str(account.balance)) + amount
            else:
                account.balance = Decimal(str(account.balance)) - amount
            
            transactions_created += 1
            
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    db.commit()
    
    return {
        "message": f"Imported {transactions_created} transactions",
        "transactions_created": transactions_created,
        "errors": errors
    }