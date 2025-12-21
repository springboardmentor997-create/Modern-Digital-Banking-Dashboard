from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.transactions.schemas import TransactionCreate, TransactionOut
from app.transactions.service import (
    create_transaction,
    get_user_transactions,
    get_account_transactions,
)
from app.dependencies import get_db, get_current_user_email
from app.models.user import User

from fastapi import UploadFile, File
from app.transactions.csv_import import import_transactions_csv

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_user_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        return create_transaction(db, user.id, tx_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=list[TransactionOut])
def list_user_transactions(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return get_user_transactions(db, user.id)


@router.get("/account/{account_id}", response_model=list[TransactionOut])
def list_account_transactions(
    account_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return get_account_transactions(db, user.id, account_id)


@router.post("/import/csv", status_code=status.HTTP_201_CREATED)
def import_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        imported = import_transactions_csv(db, user.id, file)
        return {
            "imported_count": len(imported)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
