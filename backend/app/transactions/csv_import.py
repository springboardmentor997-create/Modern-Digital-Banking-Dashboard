import csv
from io import StringIO
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.transactions.schemas import TransactionCreate
from app.transactions.service import create_transaction


REQUIRED_COLUMNS = {
    "account_id",
    "amount",
    "transaction_type",
    "category",
    "description",
    "transaction_date",
}

if file.content_type not in ["text/csv", "application/vnd.ms-excel"]:
    raise ValueError("Only CSV files are allowed")


def import_transactions_csv(
    db: Session,
    user_id: int,
    file: UploadFile,
):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(content))

    if not REQUIRED_COLUMNS.issubset(reader.fieldnames):
        raise ValueError("Invalid CSV format")

    created_transactions = []

    try:
        for row in reader:
            tx = TransactionCreate(
                account_id=int(row["account_id"].strip()),
                amount=row["amount"].strip(),
                transaction_type=row["transaction_type"].strip(),
                category=row["category"].strip(),
                description=row.get("description", "").strip() or None,
                transaction_date=row["transaction_date"].strip(),
            )

            created = create_transaction(db, user_id, tx)
            created_transactions.append(created)

        return created_transactions

    except Exception:
        db.rollback()
        raise


