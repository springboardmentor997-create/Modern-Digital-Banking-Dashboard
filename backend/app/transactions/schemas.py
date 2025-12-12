from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TransactionCreate(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    amount: Decimal
    currency: str = "USD"
    txn_type: str
    merchant: Optional[str] = None
    txn_date: datetime

class TransactionResponse(BaseModel):
    id: int
    account_id: int
    description: Optional[str]
    category: Optional[str]
    amount: Decimal
    currency: str
    txn_type: str
    merchant: Optional[str]
    txn_date: datetime
    posted_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True
