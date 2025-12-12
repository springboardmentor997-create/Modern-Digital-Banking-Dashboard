from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AccountCreate(BaseModel):
    bank_name: str
    account_type: str
    masked_account: Optional[str] = None
    currency: str = "USD"
    balance: Decimal = 0.0

class AccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    masked_account: Optional[str] = None
    currency: Optional[str] = None
    balance: Optional[Decimal] = None

class AccountResponse(BaseModel):
    id: int
    user_id: int
    bank_name: str
    account_type: str
    masked_account: Optional[str]
    currency: str
    balance: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True
