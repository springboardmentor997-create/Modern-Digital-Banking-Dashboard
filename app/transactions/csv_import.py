"""
CSV Import Utility

What:
- Imports transactions from CSV
- Used for admin or bulk data

Backend Connections:
- Uses Transaction model

Frontend Connections:
- Admin / Reports (future)
- Not used in current UI
"""

import csv
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.transactions.schemas import TransactionCreate
from app.transactions.service import create_transaction
from app.models.transaction import TransactionType


def import_transactions_from_csv(
    db: Session,
    user_id: int,
    file: UploadFile
) -> int:
    """
    CSV FORMAT (Expected):
    account_id,amount,txn_type,description,txn_date

    Example:
    1,250.00,debit,Electricity bill,2025-01-10
    """

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    content = file.file.read().decode("utf-8").splitlines()
    reader = csv.DictReader(content)

    imported_count = 0

    for row in reader:
        try:
            txn = TransactionCreate(
                account_id=int(row["account_id"]),
                amount=float(row["amount"]),
                txn_type=TransactionType(row["txn_type"]),
                description=row.get("description"),
                txn_date=datetime.strptime(
                    row["txn_date"], "%Y-%m-%d"
                ).date()
            )

            transaction = create_transaction(db, user_id, txn)

            if transaction:
                imported_count += 1

        except Exception:
            # Skip invalid rows silently
            continue

    return imported_count
