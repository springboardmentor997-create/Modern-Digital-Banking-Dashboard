from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker, require_admin, require_auditor_or_admin
from app.models.user import User
from app.database import get_db
from app.bills import service as bills_service
from app.bills.schemas import BillCreate, BillUpdate, BillResponse

router = APIRouter()


@router.get("/", response_model=List[BillResponse])
def list_bills(db: Session = Depends(get_db), current_user: User = Depends(require_auditor_or_admin)):
	# Admins and auditors can list bills (auditor is read-only)
	return bills_service.get_bills_for_user(db, current_user.id)


@router.post("/", response_model=BillResponse)
def create_bill(payload: BillCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	return bills_service.create_bill(db, current_user.id, payload)


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, payload: BillUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	bill = bills_service.get_bill(db, bill_id, current_user.id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
	return bills_service.update_bill(db, bill, payload)


@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
	# Admins can delete any bill
	bill = bills_service.get_bill_by_id(db, bill_id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
	bills_service.delete_bill(db, bill)
	return {"message": "Bill deleted"}

