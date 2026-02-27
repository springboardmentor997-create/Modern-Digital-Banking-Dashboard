from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.expense import (
    ExpenseCreate, ExpenseResponse, ExpenseUpdate, 
    ReceiptScanResponse, ExpenseAnalytics
)
from app.services.expense_service import ExpenseService
import base64
import io
from PIL import Image

router = APIRouter(tags=["Expenses"])

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new expense"""
    try:
        return ExpenseService.create_expense(db, expense, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create expense: {str(e)}")

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user's expenses with optional filtering"""
    try:
        start_dt = None
        end_dt = None
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        return ExpenseService.get_expenses(
            db, current_user.id, limit, offset, category, start_dt, end_dt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch expenses: {str(e)}")

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific expense by ID"""
    expense = ExpenseService.get_expense_by_id(db, expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an existing expense"""
    expense = ExpenseService.update_expense(db, expense_id, expense_data, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete an expense"""
    success = ExpenseService.delete_expense(db, expense_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")

@router.post("/scan-receipt", response_model=ReceiptScanResponse)
def scan_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Scan receipt using AI to extract expense data"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are supported")
        
        # Read file content
        file_content = file.file.read()
        
        # Convert to base64 for AI processing (mock)
        receipt_data = base64.b64encode(file_content).decode('utf-8')
        
        # Process with AI service
        result = ExpenseService.scan_receipt_ai(receipt_data)
        
        return ReceiptScanResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan receipt: {str(e)}")

@router.get("/analytics/summary", response_model=ExpenseAnalytics)
def get_expense_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get expense analytics and insights"""
    try:
        return ExpenseService.get_analytics(db, current_user.id, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")

@router.get("/categories/list")
def get_expense_categories(current_user = Depends(get_current_user)):
    """Get list of available expense categories"""
    return [
        {"id": 1, "name": "Food & Dining", "icon": "🍔", "color": "bg-red-500"},
        {"id": 2, "name": "Transportation", "icon": "🚗", "color": "bg-blue-500"},
        {"id": 3, "name": "Groceries", "icon": "🛒", "color": "bg-green-500"},
        {"id": 4, "name": "Entertainment", "icon": "🎬", "color": "bg-purple-500"},
        {"id": 5, "name": "Shopping", "icon": "🛍️", "color": "bg-yellow-500"},
        {"id": 6, "name": "Healthcare", "icon": "🏥", "color": "bg-pink-500"},
        {"id": 7, "name": "Utilities", "icon": "💡", "color": "bg-indigo-500"},
        {"id": 8, "name": "Travel", "icon": "✈️", "color": "bg-cyan-500"},
        {"id": 9, "name": "Education", "icon": "📚", "color": "bg-orange-500"},
        {"id": 10, "name": "Other", "icon": "📦", "color": "bg-gray-500"}
    ]

@router.get("/receipts/")
def get_receipts(
    limit: int = Query(20, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get expenses that have receipts"""
    try:
        expenses = ExpenseService.get_expenses(db, current_user.id, limit, offset)
        receipts = [
            {
                "id": expense.id,
                "amount": float(expense.amount),
                "description": expense.description,
                "merchant": expense.merchant,
                "date": expense.expense_date.isoformat(),
                "receipt_url": expense.receipt_url,
                "category": expense.category
            }
            for expense in expenses if expense.has_receipt
        ]
        return receipts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch receipts: {str(e)}")

@router.post("/bulk-import")
def bulk_import_expenses(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Import expenses from CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Mock implementation - in real app, parse CSV and create expenses
        return {
            "message": "Expenses imported successfully",
            "imported_count": 0,
            "failed_count": 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import expenses: {str(e)}")