from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.transfers.schemas import TransferCreate, TransferResponse
from app.transfers.service import send_money


router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_200_OK
)
def create_transfer(
    payload: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return send_money(
        db=db,
        user=current_user,
        payload=payload
    )
