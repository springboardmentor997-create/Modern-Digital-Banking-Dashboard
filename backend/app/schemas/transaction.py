from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base Schema
class TransactionBase(BaseModel):
    amount: float
    type: str
    account_id: int

class TransactionCreate(TransactionBase):
    pass

# Response Schema (Must match the Model columns)
class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True