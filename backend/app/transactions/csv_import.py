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
                account_id=int(row["account_id"]),
                amount=row["amount"],
                transaction_type=row["transaction_type"],
                category=row["category"],
                description=row.get("description"),
                transaction_date=row["transaction_date"],
            )

            created = create_transaction(db, user_id, tx)
            created_transactions.append(created)

        return created_transactions

    except Exception:
        db.rollback()
        raise
