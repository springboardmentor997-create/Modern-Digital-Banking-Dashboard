from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

# Base schema
class AccountBase(BaseModel):
    bank_name: str
    account_type: str
    masked_account: str
    currency: str = "INR"
    balance: Decimal = 0


# Create request
class AccountCreate(AccountBase):
    pass


# Update request
class AccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    masked_account: Optional[str] = None
    currency: Optional[str] = None
    balance: Optional[Decimal] = None


# Response schema
class AccountResponse(AccountBase):
    id: int

    class Config:
        from_attributes = True
