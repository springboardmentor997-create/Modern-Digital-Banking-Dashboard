"""
Bills Router

What:
- Exposes bill & recharge payment API
- Delegates logic to bills.service
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.bills.schemas import BillPaymentCreate
from app.tasks.bill_reminders import run_bill_reminders
from app.bills.schemas import (
    BillPaymentCreate,
    BillCreate,
    BillUpdate,
    BillOut
)

from app.bills.service import (
    pay_bill,
    create_bill,
    get_user_bills,
    update_bill,
    delete_bill
)



router = APIRouter(
    prefix="/bills",
    tags=["Bills & Recharges"]
)


@router.post("/pay")
def pay_bill_api(
    payload: BillPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = pay_bill(db, current_user, payload)

    return {
        "status": "success",
        "transaction_id": transaction.id,
        "message": "Payment successful"
    }

@router.post("/run-reminders")
def trigger_bill_reminders(
    db: Session = Depends(get_db)
):
    run_bill_reminders(db)
    return {"status": "bill reminders executed"}


@router.post("", response_model=BillOut)
def create_bill_api(
    payload: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_bill(db, current_user.id, payload)


@router.get("", response_model=list[BillOut])
def list_bills_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_bills(db, current_user.id)


@router.put("/{bill_id}", response_model=BillOut)
def update_bill_api(
    bill_id: int,
    payload: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_bill(db, bill_id, current_user.id, payload)


@router.delete("/{bill_id}")
def delete_bill_api(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_bill(db, bill_id, current_user.id)
    return {"status": "deleted"}
