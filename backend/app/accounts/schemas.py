"""
Account Schemas (Pydantic)

What:
- Defines request & response formats
- Validates incoming account data

Backend Connections:
- Used by:
  - accounts.router
  - accounts.service

Frontend Connections:
- AddAccount.jsx
- Accounts.jsx

Why Needed:
- Prevents invalid data from frontend
"""



from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional

# -----------------------------
# CREATE ACCOUNT (FROM FRONTEND)
# -----------------------------
class AccountCreate(BaseModel):
    bank_name: str = Field(..., example="SBI")
    account_type: str = Field(..., example="savings")
    account_number: str = Field(..., min_length=8, max_length=18)
    pin: str = Field(..., min_length=4, max_length=4)  # 🔐 PIN

# -----------------------------
# RESPONSE TO FRONTEND
# -----------------------------
class AccountResponse(BaseModel):
    id: int
    bank_name: str
    account_type: str
    masked_account: str
    currency: str
    balance: Decimal

    class Config:
        from_attributes = True

# -----------------------------
# DELETE ACCOUNT WITH PIN
# -----------------------------
class AccountDelete(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4)



class ChangePinSchema(BaseModel):
    account_id: int
    new_pin: str
