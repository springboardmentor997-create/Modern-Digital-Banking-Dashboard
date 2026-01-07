from pydantic import BaseModel
from datetime import date
from typing import Optional


class AdminTransactionOut(BaseModel):
    id: int
    user_name: str
    email: str
    txn_type: str
    amount: float
    category: Optional[str]
    txn_date: date

    class Config:
        orm_mode = True
