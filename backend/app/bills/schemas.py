from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field

from app.bills.models import BillFrequency


class BillCreate(BaseModel):
    name: str = Field(..., max_length=255)
    amount: Decimal = Field(..., gt=0)
    due_date: date
    frequency: BillFrequency


class BillOut(BaseModel):
    id: int
    name: str
    amount: Decimal
    due_date: date
    frequency: BillFrequency
    is_paid: bool

    class Config:
        from_attributes = True
