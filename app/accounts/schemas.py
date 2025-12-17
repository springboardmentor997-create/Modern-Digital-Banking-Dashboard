from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

class AccountCreate(BaseModel):
    bank_name: str
    account_type: str
    masked_account: str
    currency: str = "INR"
    balance: Decimal = 0


class AccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[Decimal] = None


class AccountResponse(BaseModel):
    id: int
    bank_name: str
    account_type: str
    masked_account: str
    currency: str
    balance: Decimal

    class Config:
        from_attributes = True
