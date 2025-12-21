from pydantic import BaseModel, Field
from typing import List
from decimal import Decimal
from datetime import datetime

from app.accounts.models import AccountType


class AccountCreate(BaseModel):
    bank_name: str = Field(..., max_length=255)
    account_type: AccountType
    masked_account: str = Field(..., max_length=50)
    currency: str = Field(..., min_length=3, max_length=3)
    balance: Decimal = Field(..., ge=0)


class AccountOut(BaseModel):
    id: int
    bank_name: str
    account_type: AccountType
    masked_account: str
    currency: str
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True
