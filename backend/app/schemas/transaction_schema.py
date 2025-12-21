from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TransactionBase(BaseModel):
    type: str
    description: str
    reference: Optional[str] = None
    date: date
    category: str
    status: Optional[str] = "completed"
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
