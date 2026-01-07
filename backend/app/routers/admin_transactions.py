from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
import csv
import io

from app.database import get_db
from app.schemas.admin_transaction import AdminTransactionOut
from app.services.admin_transactions import fetch_admin_transactions
from app.models.transaction import Transaction, TransactionType
from app.models.user import User

router = APIRouter(
    prefix="/admin/transactions",
    tags=["Admin Transactions"]
)


# =========================
# GET ALL ADMIN TRANSACTIONS
# =========================
@router.get("/", response_model=list[AdminTransactionOut])
def get_admin_transactions(
    category: str | None = None,
    txn_type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):
    """
    Fetch all user transactions for admin view.
    Supports filtering by:
    - category
    - txn_type (debit / credit)
    - date range
    """
    return fetch_admin_transactions(
        db=db,
        category=category,
        txn_type=txn_type,
        start_date=start_date,
        end_date=end_date
    )


# =========================
# EXPORT CSV
# =========================
@router.get("/export")
def export_transactions_csv(db: Session = Depends(get_db)):
    """
    Export all transactions as CSV (admin-only, read-only)
    """
    transactions = fetch_admin_transactions(db)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(
        ["User", "Email", "Type", "Amount", "Category", "Date"]
    )

    for t in transactions:
        writer.writerow([
            t.user_name,
            t.email,
            t.txn_type,
            float(t.amount),
            t.category,
            t.txn_date,
        ])

    return {
        "filename": "all_user_transactions.csv",
        "content": output.getvalue(),
    }


# =========================
# IMPORT CSV
# =========================
@router.post("/import")
def import_transactions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Import transactions via CSV for admin/bulk usage.

    Expected CSV headers:
    email,account_id,amount,txn_type,description,category,merchant,txn_date,currency
    """

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed"
        )

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    imported = 0

    for row in reader:
        try:
            user = db.query(User).filter(
                User.email == row.get("email")
            ).first()

            if not user:
                continue  # skip unknown users

            txn = Transaction(
                user_id=user.id,
                account_id=int(row.get("account_id", 1)),
                description=row.get(
                    "description", "Imported Transaction"
                ),
                category=row.get("category", "Imported"),
                merchant=row.get("merchant"),
                amount=float(row.get("amount", 0)),
                currency=row.get("currency", "INR"),
                txn_type=TransactionType(
                    row.get("txn_type", "debit")
                ),
                txn_date=datetime.strptime(
                    row.get("txn_date"), "%Y-%m-%d"
                ).date(),
            )

            db.add(txn)
            imported += 1

        except Exception:
            # Skip invalid rows silently (admin bulk import behavior)
            continue

    db.commit()

    return {
        "message": f"{imported} transactions imported successfully"
    }
