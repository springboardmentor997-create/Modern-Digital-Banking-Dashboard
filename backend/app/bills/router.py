from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/{bill_id}/mark-paid", response_model=BillResponse)
def mark_bill_paid(bill_id: int, payload: MarkPaidPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	"""Mark a bill as paid and auto-deduct balance if the bill records an account.

	Uses a POST endpoint and performs ownership checks. This endpoint is
	intentionally minimal to avoid Pydantic validation errors when the UI
	only sends an optional `account_id`.
	"""
	# Fetch bill (safe helper raises 404 if missing)
	bill = bills_service.get_bill_safe(db, bill_id)

	# Ownership check: non-admins may only mark their own bills
	if getattr(current_user, "role", None) != "admin" and bill.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

	# If this is the first time marking paid, auto-deduct from bill.account_id when present
	if getattr(bill, "status", None) != "paid":
		if hasattr(bill, "account_id") and getattr(bill, "account_id"):
			from app.models.account import Account
			from decimal import Decimal

			acct = db.query(Account).filter(Account.id == bill.account_id).first()
			if acct:
				try:
					acct.balance = (acct.balance or Decimal("0")) - (bill.amount_due or Decimal("0"))
					db.add(acct)
					print(f"💰 AUTO-DEDUCT: Bill {bill_id} → Account {bill.account_id} balance: {acct.balance}")
				except Exception:
					# Defensive: if anything goes wrong with deduction, don't fail the whole request
					pass

	# Mark bill paid
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

