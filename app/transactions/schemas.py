from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional


# -----------------------------
# BASE
# -----------------------------
class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    txn_type: str = Field(..., example="debit")  # debit | credit
    category: str = Field(default="Uncategorized")
    description: Optional[str] = None
    txn_date: Optional[date] = None


# -----------------------------
# CREATE (USER)
# -----------------------------
class TransactionCreate(TransactionBase):
    account_id: int


# -----------------------------
# RESPONSE (USER)
# -----------------------------
class TransactionResponse(TransactionBase):
    id: int
    account_id: int

    class Config:
        from_attributes = True
