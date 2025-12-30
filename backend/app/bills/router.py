from fastapi import APIRouter, Depends, HTTPException, status
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
    """
    Create a new bill for the logged-in user
    """
    try:
        return create_bill(
            db=db,
            user_id=current_user.id,
            bill_in=bill_in,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/", response_model=list[BillOut])
def list_user_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all bills for the logged-in user
    """
    return get_user_bills(
        db=db,
        user_id=current_user.id,
    )


@router.put("/{bill_id}/pay", response_model=BillOut)
def pay_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a bill as paid
    """
    try:
        return mark_bill_as_paid(
            db=db,
            user_id=current_user.id,
            bill_id=bill_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
