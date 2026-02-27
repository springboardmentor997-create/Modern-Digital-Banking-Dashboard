from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"



class TransactionCreate(BaseModel):
    account_id: int
    amount: Decimal
    txn_type: str  # Changed from transaction_type
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None  # Added date field
    merchant: Optional[str] = None  # Added merchant field
    
    @field_validator('amount')
    def validate_amount(cls, v):
        if v == 0:
            raise ValueError('Amount cannot be zero')
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if v and len(v.strip()) > 500:
            raise ValueError('Description cannot exceed 500 characters')
        return v.strip() if v else v

class TransactionResponse(BaseModel):
    id: int
    account_id: int
    amount: Decimal
    txn_type: str  # Changed from transaction_type
    description: Optional[str]
    category: Optional[str]
    txn_date: datetime  # Changed from transaction_date
    created_at: datetime
    
    class Config:
        from_attributes = True