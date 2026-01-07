from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List

class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    location: Optional[str] = None
    merchant: Optional[str] = None
    expense_date: Optional[str] = None
    has_receipt: bool = False
    ai_suggested: bool = False

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    merchant: Optional[str] = None
    expense_date: Optional[str] = None
    has_receipt: Optional[bool] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    description: str
    category: str
    location: Optional[str]
    merchant: Optional[str]
    expense_date: datetime
    has_receipt: bool
    ai_suggested: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ReceiptScanResponse(BaseModel):
    amount: float
    description: str
    category: str
    merchant: str
    location: str
    confidence: float
    ai_suggested: bool

class ExpenseAnalytics(BaseModel):
    total_expenses: float
    category_breakdown: Dict[str, float]
    monthly_trend: List[Dict]
    top_merchants: List[Dict]
    average_daily: float
    highest_expense: float
    expense_count: int