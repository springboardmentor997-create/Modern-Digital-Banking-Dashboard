"""
Transactions Router

What:
- Handles money transfers
- Fetches transaction history

Backend Connections:
- Uses:
  - transaction service
  - auth dependency

Frontend Connections:
- SendToUpi.jsx
- SendToSelf.jsx
- SendToBank.jsx
- Transactions.jsx
"""


from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from fastapi import UploadFile, File
from app.transactions.csv_import import import_transactions_from_csv

from app.transactions.schemas import (
    TransactionCreate,
    TransactionResponse
)
from app.transactions.service import (
    create_transaction,
    get_account_transactions
)

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)

# --------------------------------------------------
# CREATE TRANSACTION (USER – MANUAL)
# --------------------------------------------------
@router.post("", response_model=TransactionResponse)
def add_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = create_transaction(db, current_user.id, payload)

    if not transaction:
        raise HTTPException(status_code=404, detail="Account not found")

    return transaction


# --------------------------------------------------
# LIST TRANSACTIONS (USER – FILTERED)
# --------------------------------------------------
@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    account_id: Optional[int] = Query(None),
    txn_type: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == current_user.id)
    )

    if account_id:
        query = query.filter(Transaction.account_id == account_id)

    if txn_type:
        query = query.filter(Transaction.txn_type == txn_type)

    if from_date:
        query = query.filter(Transaction.txn_date >= from_date)

    if to_date:
        query = query.filter(Transaction.txn_date <= to_date)

    if search:
        term = f"%{search.lower()}%"
        query = query.filter(Transaction.description.ilike(term))

    return (
        query
        .order_by(Transaction.txn_date.desc())
        .all()
    )


# --------------------------------------------------
# LIST TRANSACTIONS BY ACCOUNT (USER)
# --------------------------------------------------
@router.get(
    "/account/{account_id}",
    response_model=List[TransactionResponse]
)
def list_transactions_by_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_account_transactions(db, current_user.id, account_id)




# --------------------------------------------------
# RECENT TRANSACTIONS (LAST 5 – DASHBOARD)
# --------------------------------------------------
@router.get("/recent")
def recent_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    txns = (
        db.query(Transaction)
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.user_id == current_user.id)
        .order_by(Transaction.txn_date.desc())
        .limit(5)
        .all()
    )

    return txns



@router.post("/import/csv")
def import_transactions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = import_transactions_from_csv(db, current_user.id, file)
    return {
        "status": "success",
        "imported_records": count
    }