from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker, require_admin, require_write_access
from app.models.user import User
from app.models.account import Account
from app.models.bill import Bill
from app.database import get_db
from app.bills import service as bills_service
from app.bills.schemas import BillCreate, BillUpdate, BillResponse
from app.transactions.service import TransactionService
from app.transactions.schemas import TransactionCreate
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
import traceback

router = APIRouter()


@router.get("/", response_model=List[BillResponse])

def list_bills(account_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	"""List bills. If `account_id` query param is provided, returns bills for that account
	(owners and admins only). Otherwise returns all bills (admin) or user's bills."""
	print(f"DEBUG: Fetching bills for user_id={getattr(current_user, 'id', None)} account_id={account_id}")
	try:
		# If account_id filter provided, validate account and RBAC then return filtered bills
		if account_id is not None:
			acct = db.query(Account).filter(Account.id == account_id).first()
			if not acct:
				raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
			# Non-admins may only query their own accounts
			if getattr(current_user, "role", None) != "admin" and acct.user_id != current_user.id:
				raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
			bills = db.query(Bill).filter(Bill.account_id == account_id).all()
		else:
			user_role = getattr(current_user, "role", "user")
			if user_role == "admin":
				bills = bills_service.get_all_bills(db)
			else:
				bills = bills_service.get_bills_for_user(db, current_user.id)

		print(f"DEBUG: Found {len(bills)} bills")
		# Convert ORM instances to plain dicts to avoid session/lazy-load
		result = []
		for b in bills:
			result.append({
				"id": getattr(b, "id", None),
				"user_id": getattr(b, "user_id", None),
				"account_id": getattr(b, "account_id", None),
				"biller_name": getattr(b, "biller_name", None),
				"due_date": getattr(b, "due_date", None),
				"amount_due": getattr(b, "amount_due", None),
				"status": getattr(b, "status", None),
				"auto_pay": getattr(b, "auto_pay", False),
				"created_at": getattr(b, "created_at", None),
			})
		return result
	except HTTPException:
		raise
	except Exception as e:
		print(f"FATAL LIST ERROR: {type(e).__name__}: {str(e)}")
		print(f"Traceback: {traceback.format_exc()}")
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"List error: {str(e)}")


@router.post("/accounts/{account_id}/bills", response_model=BillResponse)
def create_bill(account_id: int, payload: BillCreate, db: Session = Depends(get_db), current_user: User = Depends(require_write_access)):
	# Verify account exists and belongs to the current user (unless admin)
	account = db.query(Account).filter(Account.id == account_id).first()
	if not account:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

	if getattr(current_user, "role", None) != "admin" and account.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not found")

	# Use the account owner as the bill's `user_id` (prevents admin-created bills being assigned to admin)
	bill_owner_id = account.user_id

	try:
		created = bills_service.create_bill(db, bill_owner_id, payload, account_id)
		try:
			print(f"DEBUG: Created bill id={getattr(created, 'id', None)} for user={current_user.id} account={account_id}")
		except Exception:
			pass
		return created

	# close create_bill try/except
	except Exception as e:
		print(f"FATAL CREATE ERROR: {type(e).__name__}: {str(e)}")
		print(f"Traceback: {traceback.format_exc()}")
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Create error: {str(e)}")


@router.get("/accounts/{account_id}", response_model=List[BillResponse])
def list_bills_for_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	"""List bills for a specific account. Admins see all; regular users only if they own the account."""
	# Verify account exists
	acct = db.query(Account).filter(Account.id == account_id).first()
	if not acct:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

	# RBAC: non-admins may only list bills for their own accounts
	if getattr(current_user, "role", None) != "admin" and acct.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

	bills = db.query(Bill).filter(Bill.account_id == account_id).all()
	result = []
	for b in bills:
		result.append({
			"id": getattr(b, "id", None),
			"user_id": getattr(b, "user_id", None),
			"account_id": getattr(b, "account_id", None),
			"biller_name": getattr(b, "biller_name", None),
			"due_date": getattr(b, "due_date", None),
			"amount_due": getattr(b, "amount_due", None),
			"status": getattr(b, "status", None),
			"auto_pay": getattr(b, "auto_pay", False),
			"created_at": getattr(b, "created_at", None),
		})
	return result


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, payload: BillUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_write_access)):
	# Fetch bill by id and enforce RBAC
	bill = bills_service.get_bill_by_id(db, bill_id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

	# Only admins or owner can update
	if getattr(current_user, "role", None) != "admin" and bill.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Own bill only")

	# Normalize incoming data and validate account_id if provided
	data = payload.model_dump(exclude_unset=True)
	acct_id = data.get("account_id") if "account_id" in data else None
	if "account_id" in data:
		# Treat 0 or empty as explicit removal of linked account
		if acct_id in (0, "0", "", None):
			data["account_id"] = None
		else:
			# Ensure the referenced account exists and (for non-admins) belongs to user
			acct = db.query(Account).filter(Account.id == int(acct_id)).first()
			if not acct:
				raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced account not found")
			if getattr(current_user, "role", None) != "admin" and acct.user_id != current_user.id:
				raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account does not belong to user")

	# Build a sanitized BillUpdate model from validated data
	try:
		new_payload = BillUpdate(**data)
	except Exception as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	# Keep previous status to detect transition to 'paid'
	prev_status = getattr(bill, "status", None)

	# Delegate update logic to service (handles balance adjustments)
	updated = bills_service.update_bill(db, bill, new_payload)

	# If transitioned to paid, require an account to create a transaction
	new_status = getattr(updated, "status", None)
	acct_id_after = getattr(new_payload, "account_id", None) or getattr(updated, "account_id", None)
	if prev_status != "paid" and new_status == "paid":
		if not acct_id_after:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="account_id is required to mark a bill as paid and create a transaction")

		try:
			from decimal import Decimal

			amt = Decimal(str(getattr(updated, "amount_due", 0)))
			tx_payload = TransactionCreate(
				description=f"Bill payment: {updated.biller_name}",
				merchant=updated.biller_name,
				amount=amt,
				category="Bills",
				txn_type="debit",
				currency="INR",
				txn_date=datetime.utcnow()
			)
			TransactionService.create_transaction(db, acct_id_after, tx_payload)
		except Exception as e:
			# Surface as server error so client knows transaction failed
			print(f"ERROR creating transaction after bill update: {e}")
			raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create transaction: {e}")

	return updated


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	# Allow admins to fetch any bill; regular users only their own
	bill = bills_service.get_bill_by_id(db, bill_id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

	if getattr(current_user, "role", None) != "admin" and bill.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Own bill only")

	return bill


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

	# Require an account id to create a transaction and deduct balance
	if getattr(bill, "status", None) != "paid":
		if not acct_id:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="account_id is required to mark a bill as paid and create a transaction")

		acct = db.query(Account).filter(Account.id == acct_id).first()
		if acct:
			try:
				from decimal import Decimal

				amt = Decimal(str(bill.amount_due or 0))
				curr = Decimal(str(acct.balance or 0))
				acct.balance = curr - amt
				db.add(acct)
				print(f"💰 DEDUCTED: Bill {id} → Account {acct_id}: {acct.balance}")

				# Create transaction record for the deduction (fail loudly so client knows)
				tx_payload = TransactionCreate(
					description=f"Bill payment: {bill.biller_name}",
					merchant=bill.biller_name,
					amount=amt,
					category="Bills",
					txn_type="debit",
					currency="INR",
					txn_date=datetime.utcnow()
				)
				TransactionService.create_transaction(db, acct_id, tx_payload)
			except Exception as e:
				# If transaction creation or balance update fails, rollback and surface error
				try:
					db.rollback()
				except Exception:
					pass
				print(f"ERROR creating transaction for bill mark-paid: {e}")
				raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create transaction: {e}")

	# Mark as paid
	bill.status = "paid"
	db.add(bill)
	db.commit()
	db.refresh(bill)
	return bill


@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	# Admins may delete any bill; regular users may delete their own bills
	bill = bills_service.get_bill_by_id(db, bill_id)
	if not bill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

	# Allow admins or the bill owner
	if getattr(current_user, "role", None) != "admin" and bill.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Own bill only")

	bills_service.delete_bill(db, bill)
	return {"message": "Bill deleted"}

