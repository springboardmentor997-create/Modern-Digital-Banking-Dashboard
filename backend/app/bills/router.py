from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker, require_admin, require_write_access
from app.models.user import User
from app.database import get_db
from app.bills import service as bills_service
from app.bills.schemas import BillCreate, BillUpdate, BillResponse
from app.transactions.service import TransactionService
from app.transactions.schemas import TransactionCreate
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


@router.get("/", response_model=List[BillResponse])
def list_bills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	# Admins and auditors can list all bills; regular users only their own.
	user_role = getattr(current_user, "role", "user")
	if user_role in ("admin", "auditor"):
		return bills_service.get_all_bills(db)
	return bills_service.get_bills_for_user(db, current_user.id)


@router.post("/", response_model=BillResponse)
def create_bill(payload: BillCreate, db: Session = Depends(get_db), current_user: User = Depends(require_write_access)):
	return bills_service.create_bill(db, current_user.id, payload)


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, payload: BillUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_write_access)):
	bill = bills_service.get_bill(db, bill_id, current_user.id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

	prev_status = getattr(bill, "status", None)
	updated = bills_service.update_bill(db, bill, payload)

	# If the bill transitioned to paid and client supplied an account_id, record a debit transaction
	try:
		new_status = getattr(updated, "status", None)
		acct_id = getattr(payload, "account_id", None)
		if prev_status != "paid" and new_status == "paid" and acct_id:
			tx_payload = TransactionCreate(
				description=f"Bill payment: {updated.biller_name}",
				merchant=updated.biller_name,
				amount=updated.amount_due,
				category="Bills",
				txn_type="debit",
				currency="INR",
				txn_date=datetime.utcnow()
			)
			TransactionService.create_transaction(db, acct_id, tx_payload)
	except Exception:
		# Don't fail the update if transaction creation fails
		pass

	return updated


class MarkPaidPayload(BaseModel):
	account_id: Optional[int] = None


@router.post("/{id}/mark-paid", response_model=BillResponse)
def mark_bill_paid(id: int, payload: MarkPaidPayload = Body(None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	"""Mark a bill as paid (inline DB query). Non-admins may only mark their own bills.

	This handler performs a direct DB query to avoid reliance on service
	helper methods and prevents AttributeError when a service method is missing.
	"""
	from app.models.bill import Bill
	from app.models.account import Account

	# Directly load the bill
	bill = db.query(Bill).filter(Bill.id == id).first()
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

	# RBAC: only admins or the bill owner may mark paid
	if getattr(current_user, "role", None) != "admin" and bill.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Own bill only")

	# Auto-deduct balance: prefer provided payload.account_id, otherwise use bill.account_id
	acct_id = None
	if payload and getattr(payload, "account_id", None):
		acct_id = payload.account_id
	elif getattr(bill, "account_id", None):
		acct_id = bill.account_id

	if getattr(bill, "status", None) != "paid" and acct_id:
		acct = db.query(Account).filter(Account.id == acct_id).first()
		if acct:
			try:
				acct.balance = float(acct.balance or 0) - float(bill.amount_due or 0)
				db.add(acct)
				print(f"💰 DEDUCTED: Bill {id} → Account {acct_id}: {acct.balance}")
				# Create transaction record for the deduction
				try:
					tx_payload = TransactionCreate(
						description=f"Bill payment: {bill.biller_name}",
						merchant=bill.biller_name,
						amount=bill.amount_due,
						category="Bills",
						txn_type="debit",
						currency="INR",
						txn_date=datetime.utcnow()
					)
					TransactionService.create_transaction(db, acct_id, tx_payload)
				except Exception:
					# don't fail the mark-paid if transaction creation fails
					pass
			except Exception:
				# Don't fail the operation if deduction fails
				pass

	# Mark as paid
	bill.status = "paid"
	db.add(bill)
	db.commit()
	db.refresh(bill)
	return bill


@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
	# Admins can delete any bill
	bill = bills_service.get_bill_by_id(db, bill_id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
	bills_service.delete_bill(db, bill)
	return {"message": "Bill deleted"}

