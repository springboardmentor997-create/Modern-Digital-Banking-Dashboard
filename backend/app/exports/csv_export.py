"""
CSV Export Utility

What:
- Exports all user transactions to CSV

Backend Connections:
- Used by exports router

Frontend Connections:
- Download CSV button
"""

import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def export_transactions_csv(db: Session, user_id: int):
    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Transaction ID",
        "Account ID",
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
        "Currency"
    ])

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.txn_date.desc())
        .all()
    )

    for txn in transactions:
        writer.writerow([
            txn.id,
            txn.account_id,
            txn.txn_date,
            txn.txn_type.value,
            txn.category,
            txn.description,
            txn.amount,
            txn.currency
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=transactions.csv"
        }
    )
