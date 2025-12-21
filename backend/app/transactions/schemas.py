from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Literal

class TransactionBase(BaseModel):
    account_id: int
    amount: Decimal = Field(..., gt=0)

class TransactionCreate(TransactionBase):
    type: Literal["DEPOSIT", "WITHDRAW"]

class TransactionResponse(TransactionBase):
    id: int
    type: str
    created_at: datetime

    class Config:
        from_attributes = True
