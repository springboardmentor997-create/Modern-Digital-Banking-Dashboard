from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.bill import Bill
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class BillCreate(BaseModel):
    name: str
    amount: float
    due_date: str

@router.get("")
def get_bills(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).all()
    
    # Create sample bills if none exist
    if not bills:
        sample_bills = [
            Bill(
                user_id=current_user.id,
                biller_name="Electricity Bill",
                amount_due=150.00,
                due_date=date(2025, 1, 15)
            ),
            Bill(
                user_id=current_user.id,
                biller_name="Internet Bill",
                amount_due=80.00,
                due_date=date(2025, 1, 20)
            )
        ]
        for bill in sample_bills:
            db.add(bill)
        db.commit()
        bills = sample_bills
    
    return [
        {
            "id": bill.id,
            "name": bill.biller_name,
            "amount": float(bill.amount_due),
            "dueDate": bill.due_date.isoformat(),
            "status": bill.status.value if bill.status else "pending",
            "autoPay": getattr(bill, 'auto_pay', False),
            "category": "Bills & Utilities"
        } for bill in bills
    ]

@router.post("")
def create_bill(bill_data: BillCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    db_bill = Bill(
        user_id=current_user.id,
        biller_name=bill_data.name,
        amount_due=bill_data.amount,
        due_date=date.fromisoformat(bill_data.due_date)
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    
    return {
        "id": db_bill.id,
        "name": db_bill.biller_name,
        "amount": float(db_bill.amount_due),
        "dueDate": db_bill.due_date.isoformat(),
        "status": "pending",
        "autoPay": getattr(db_bill, 'auto_pay', False),
        "category": "Bills & Utilities"
    }

@router.get("/exchange-rates")
def get_exchange_rates():
    # Return mock exchange rates - no authentication required for public data
    return {
        "INR": 1.0,
        "USD": 0.012,
        "EUR": 0.010,
        "GBP": 0.0096,
        "JPY": 1.82
    }

@router.get("/{bill_id}")
def get_bill(bill_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    return {
        "id": bill.id,
        "name": bill.biller_name,
        "amount": float(bill.amount_due),
        "dueDate": bill.due_date.isoformat(),
        "status": bill.status.value if bill.status else "pending",
        "autoPay": getattr(bill, 'auto_pay', False),
        "category": "Bills & Utilities"
    }

@router.put("/{bill_id}")
def update_bill(bill_id: int, bill_data: BillCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    bill.biller_name = bill_data.name
    bill.amount_due = bill_data.amount
    bill.due_date = date.fromisoformat(bill_data.due_date)
    
    db.commit()
    db.refresh(bill)
    
    return {
        "id": bill.id,
        "name": bill.biller_name,
        "amount": float(bill.amount_due),
        "dueDate": bill.due_date.isoformat(),
        "status": bill.status.value if bill.status else "pending",
        "autoPay": getattr(bill, 'auto_pay', False),
        "category": "Bills & Utilities"
    }

@router.delete("/{bill_id}")
def delete_bill(bill_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(bill)
    db.commit()
    
    return {"message": "Bill deleted successfully"}

@router.patch("/{bill_id}/pay")
def pay_bill(bill_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    from app.models.bill import BillStatus
    bill.status = BillStatus.paid
    
    db.commit()
    db.refresh(bill)
    
    return {
        "message": "Bill marked as paid",
        "id": bill.id,
        "status": bill.status.value
    }

@router.patch("/{bill_id}/autopay")
def toggle_autopay(bill_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Toggle autopay status - handle missing field gracefully
    current_autopay = getattr(bill, 'auto_pay', False)
    try:
        bill.auto_pay = not current_autopay
        db.commit()
        db.refresh(bill)
        new_status = getattr(bill, 'auto_pay', False)
    except Exception:
        # If auto_pay field doesn't exist, return current state
        new_status = False
    
    return {
        "message": f"Auto-pay {'enabled' if new_status else 'disabled'}",
        "id": bill.id,
        "autoPay": new_status
    }