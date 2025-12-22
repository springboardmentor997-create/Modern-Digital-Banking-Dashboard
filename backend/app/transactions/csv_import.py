import csv
from io import StringIO
from fastapi import UploadFile
from sqlalchemy.orm import Session

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
    # 1️⃣ Validate file type
    if file.content_type not in ["text/csv", "application/vnd.ms-excel"]:
        raise ValueError("Only CSV files are allowed")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(content))

    # 2️⃣ Validate CSV headers
    if not reader.fieldnames or not REQUIRED_COLUMNS.issubset(reader.fieldnames):
        raise ValueError("Invalid CSV format or missing required columns")

    created_transactions = []

    try:
        # 3️⃣ Process rows
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

        # 4️⃣ Commit once (atomic)
        db.commit()
        return created_transactions

    except Exception:
        # 5️⃣ Rollback on ANY failure
        db.rollback()
        raise
