from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import csv
import io
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.account import Account
from app.dependencies import get_current_user

router = APIRouter(tags=["Exports"])

@router.get("/transactions/csv")
def export_transactions_csv(
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if start_date:
        start = datetime.fromisoformat(start_date)
    else:
        start = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
    else:
        end = datetime.utcnow()
    
    transactions = db.query(Transaction).join(Account).filter(
        Account.user_id == current_user.id,
        Transaction.txn_date >= start,
        Transaction.txn_date <= end
    ).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        'date', 'amount', 'type', 'description', 'category', 'merchant'
    ])
    
    for t in transactions:
        writer.writerow([
            t.txn_date.strftime('%Y-%m-%d'),
            str(t.amount),
            t.txn_type,
            t.description or '',
            t.category or '',
            t.merchant or ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )

@router.get("/transactions/template")
def download_csv_template():
    """Download CSV template for transaction import"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow(['date', 'amount', 'type', 'description', 'category', 'merchant'])
    
    # Sample rows
    writer.writerow(['2024-01-15', '100.00', 'credit', 'Salary deposit', 'Income', 'Company Inc'])
    writer.writerow(['2024-01-16', '25.50', 'debit', 'Coffee purchase', 'Food', 'Starbucks'])
    writer.writerow(['2024-01-17', '500.00', 'debit', 'Rent payment', 'Housing', 'Property Manager'])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transaction_template.csv"}
    )