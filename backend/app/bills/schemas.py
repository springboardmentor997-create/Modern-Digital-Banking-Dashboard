from pydantic import BaseModel, validator
from decimal import Decimal
from datetime import datetime
from typing import Optional

class BillCreate(BaseModel):
    bill_name: str
    amount: Decimal
    due_date: datetime
    category: str
    description: Optional[str] = None

    @validator('bill_name')
    def validate_bill_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Bill name must be at least 2 characters')
        return v.strip()

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class BillUpdate(BaseModel):
    bill_name: Optional[str] = None
    amount: Optional[Decimal] = None
    due_date: Optional[datetime] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_paid: Optional[int] = None

    @validator('bill_name')
    def validate_bill_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Bill name must be at least 2 characters')
        return v.strip() if v else v

    @validator('amount')
    def validate_amount(cls, v):
        if v and v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class BillResponse(BaseModel):
    id: int
    bill_name: str
    amount: Decimal
    due_date: datetime
    category: str
    description: Optional[str]
    is_paid: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
