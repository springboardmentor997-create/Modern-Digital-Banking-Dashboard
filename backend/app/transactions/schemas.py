from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date, datetime

from app.transactions.models import TransactionType, TransactionCategory


class TransactionCreate(BaseModel):
    account_id: int
    amount: Decimal = Field(..., gt=0)
    transaction_type: TransactionType
    category: TransactionCategory
    description: str | None = None
    transaction_date: date


class TransactionOut(BaseModel):
    id: int
    account_id: int
    amount: Decimal
    transaction_type: TransactionType
    category: TransactionCategory
    description: str | None
    transaction_date: date
    created_at: datetime

    class Config:
        from_attributes = True
