from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.bills.schemas import BillCreate, BillResponse, BillUpdate
from app.bills.service import BillService
from app.dependencies import get_current_user

router = APIRouter(tags=["Bills"])

@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(
    bill: BillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        return BillService.create_bill(db, bill, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[BillResponse])
def get_bills(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return BillService.get_bills(db, current_user.id)

@router.get("/exchange-rates")
def get_exchange_rates():
    return {
        "USD": 0.012,
        "EUR": 0.010,
        "GBP": 0.0096,
        "JPY": 0.00018,
        "CAD": 0.016
    }

@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    bill = BillService.get_bill_by_id(db, bill_id, current_user.id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    bill_data: BillUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    bill = BillService.update_bill(db, bill_id, bill_data, current_user.id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = BillService.delete_bill(db, bill_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Bill not found")
