from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

class AccountCreate(BaseModel):
    bank_name: str
    account_type: str
    masked_account: str
    currency: str = "INR"
    balance: Decimal = 0


class AccountResponse(BaseModel):
    id: int
    bank_name: str
    account_type: str
    masked_account: str
    currency: str
    balance: Decimal

    class Config:
        from_attributes = True
