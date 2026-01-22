from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
from enum import Enum

class AccountType(str, Enum):
    CHECKING = "checking"
    SAVINGS = "savings"
    CURRENT = "current"
    CREDIT = "credit_card"
    INVESTMENT = "investment"

class AccountCreate(BaseModel):
    name: str
    account_type: AccountType
    bank_name: Optional[str] = "Main Bank"
    balance: Optional[Decimal] = Decimal('0.00')

    @field_validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Account name must be at least 2 characters')
        return v.strip()


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[AccountType] = None
    

class AccountResponse(BaseModel):
    id: int
    name: Optional[str] = None  # Made optional to match model
    account_type: str
    balance: Decimal
    masked_account: Optional[str] = None  # Made optional
    bank_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AccountBalance(BaseModel):
    account_id: int
    balance: Decimal