from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.bills.schemas import BillCreate, BillOut
from app.bills.service import (
    create_bill,
    get_user_bills,
    mark_bill_as_paid,
)

router = APIRouter(
    prefix="/bills",
    tags=["Bills"],
)


@router.post("/", response_model=BillOut)
def create_new_bill(
    bill_in: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_bill(db, current_user.id, bill_in)


@router.get("/", response_model=list[BillOut])
def list_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_bills(db, current_user.id)


@router.patch("/{bill_id}/pay")
def pay_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = mark_bill_as_paid(db, current_user.id, bill_id)

    if not success:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {"message": "Bill marked as paid"}
