"""
Exports Router

What:
- Exposes CSV & PDF download APIs

Frontend Connections:
- Reports page
- Payment success page
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.exports.csv_export import export_transactions_csv
from app.exports.pdf_export import generate_transaction_pdf

router = APIRouter(
    prefix="/exports",
    tags=["Exports"]
)


@router.get("/transactions/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return export_transactions_csv(db, current_user.id)


@router.get("/transactions/{transaction_id}/pdf")
def export_pdf(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        return {"detail": "Transaction not found"}

    return generate_transaction_pdf(transaction)
