from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Banking Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

# Pydantic models
class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    location: Optional[str] = None
    merchant: Optional[str] = None
    has_receipt: bool = False
    ai_suggested: bool = False

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    location: Optional[str] = None
    merchant: Optional[str] = None
    has_receipt: bool
    ai_suggested: bool
    expense_date: str
    user_id: Optional[int] = None

class BillCreate(BaseModel):
    name: str
    amount: float
    due_date: str

class BillResponse(BaseModel):
    id: int
    name: str
    amount: float
    dueDate: str
    status: str
    autoPay: bool

class Category(BaseModel):
    name: str
    icon: str
    color: str

class Analytics(BaseModel):
    total_expenses: float
    average_daily: float
    expense_count: int
    highest_expense: float
    category_breakdown: dict
    top_merchants: List[dict]

# Mock data storage (in production, use a proper database)
expenses_db = []
bills_db = [
    {"id": 1, "name": "Electricity Bill", "amount": 2500.0, "dueDate": "2024-01-15", "status": "pending", "autoPay": False},
    {"id": 2, "name": "Internet Bill", "amount": 1200.0, "dueDate": "2024-01-20", "status": "paid", "autoPay": True},
    {"id": 3, "name": "Water Bill", "amount": 800.0, "dueDate": "2024-01-25", "status": "pending", "autoPay": False}
]
categories_db = [
    {"name": "Food & Dining", "icon": "🍔", "color": "bg-red-500"},
    {"name": "Transportation", "icon": "🚗", "color": "bg-blue-500"},
    {"name": "Groceries", "icon": "🛒", "color": "bg-green-500"},
    {"name": "Entertainment", "icon": "🎬", "color": "bg-purple-500"},
    {"name": "Shopping", "icon": "🛍️", "color": "bg-yellow-500"},
    {"name": "Healthcare", "icon": "🏥", "color": "bg-pink-500"},
    {"name": "Utilities", "icon": "💡", "color": "bg-indigo-500"}
]

# Authentication dependency (simplified)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        # In a real app, verify the JWT token here
        return {"user_id": 1, "username": "user"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Routes
@app.get("/")
async def root():
    return {"message": "Banking Backend API is running"}

@app.get("/api/expenses/", response_model=List[ExpenseResponse])
async def get_expenses():
    return expenses_db

@app.post("/api/expenses/", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate):
    new_expense = {
        "id": len(expenses_db) + 1,
        "amount": expense.amount,
        "description": expense.description,
        "category": expense.category,
        "location": expense.location,
        "merchant": expense.merchant,
        "has_receipt": expense.has_receipt,
        "ai_suggested": expense.ai_suggested,
        "expense_date": datetime.now().isoformat(),
        "user_id": 1
    }
    expenses_db.append(new_expense)
    return new_expense

@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense: ExpenseCreate):
    for i, exp in enumerate(expenses_db):
        if exp["id"] == expense_id:
            expenses_db[i].update({
                "amount": expense.amount,
                "description": expense.description,
                "category": expense.category,
                "location": expense.location,
                "merchant": expense.merchant,
                "has_receipt": expense.has_receipt
            })
            return expenses_db[i]
    raise HTTPException(status_code=404, detail="Expense not found")

@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: int):
    for i, exp in enumerate(expenses_db):
        if exp["id"] == expense_id:
            expenses_db.pop(i)
            return {"message": "Expense deleted successfully"}
    raise HTTPException(status_code=404, detail="Expense not found")

@app.get("/api/expenses/categories/list", response_model=List[Category])
async def get_categories():
    return categories_db

@app.get("/api/expenses/receipts/")
async def get_receipts():
    receipts = [exp for exp in expenses_db if exp.get("has_receipt", False)]
    return receipts

@app.get("/api/expenses/analytics/summary")
async def get_analytics(days: int = 30):
    if not expenses_db:
        return {
            "total_expenses": 0,
            "average_daily": 0,
            "expense_count": 0,
            "highest_expense": 0,
            "category_breakdown": {},
            "top_merchants": []
        }
    
    total_expenses = sum(exp["amount"] for exp in expenses_db)
    expense_count = len(expenses_db)
    highest_expense = max(exp["amount"] for exp in expenses_db) if expenses_db else 0
    average_daily = total_expenses / days if days > 0 else 0
    
    # Category breakdown
    category_breakdown = {}
    for exp in expenses_db:
        category = exp["category"]
        category_breakdown[category] = category_breakdown.get(category, 0) + exp["amount"]
    
    # Top merchants
    merchant_totals = {}
    for exp in expenses_db:
        merchant = exp.get("merchant", "Unknown")
        if merchant not in merchant_totals:
            merchant_totals[merchant] = {"total": 0, "count": 0}
        merchant_totals[merchant]["total"] += exp["amount"]
        merchant_totals[merchant]["count"] += 1
    
    top_merchants = [
        {"merchant": merchant, "total": data["total"], "count": data["count"]}
        for merchant, data in sorted(merchant_totals.items(), key=lambda x: x[1]["total"], reverse=True)[:5]
    ]
    
    return {
        "total_expenses": total_expenses,
        "average_daily": average_daily,
        "expense_count": expense_count,
        "highest_expense": highest_expense,
        "category_breakdown": category_breakdown,
        "top_merchants": top_merchants
    }

# Bills endpoints
@app.get("/api/bills", response_model=List[BillResponse])
async def get_bills():
    return bills_db

@app.post("/api/bills", response_model=BillResponse)
async def create_bill(bill: BillCreate):
    new_bill = {
        "id": len(bills_db) + 1,
        "name": bill.name,
        "amount": bill.amount,
        "dueDate": bill.due_date,
        "status": "pending",
        "autoPay": False
    }
    bills_db.append(new_bill)
    return new_bill

@app.patch("/api/bills/{bill_id}/autopay")
async def toggle_autopay(bill_id: int):
    for bill in bills_db:
        if bill["id"] == bill_id:
            bill["autoPay"] = not bill["autoPay"]
            return {
                "message": f"Auto-pay {'enabled' if bill['autoPay'] else 'disabled'} for {bill['name']}",
                "autoPay": bill["autoPay"]
            }
    raise HTTPException(status_code=404, detail="Bill not found")

@app.get("/api/bills/exchange-rates")
async def get_exchange_rates():
    return {"USD": 83.12, "EUR": 89.45, "GBP": 104.23}

# Alerts endpoints
@app.get("/api/alerts/summary")
async def get_alerts_summary():
    return {"total": 3, "high": 1, "medium": 2, "low": 0}

@app.post("/api/alerts/bill-reminders")
async def check_bill_reminders():
    return {"message": "Bill reminders checked"}

# Auth endpoints
@app.post("/api/auth/login")
async def login(credentials: dict):
    # Simple mock login - accepts any email/password
    return {
        "access_token": "mock-jwt-token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": credentials.get("email", "user@example.com"),
            "name": "User",
            "role": "user"
        }
    }

@app.post("/api/auth/register")
async def register(user_data: dict):
    return {
        "message": "User registered successfully",
        "user": {
            "id": 1,
            "email": user_data.get("email"),
            "name": user_data.get("name")
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)