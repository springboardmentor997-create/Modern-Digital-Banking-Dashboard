from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class BillCreate(BaseModel):
    biller_name: str
    due_date: date
    amount_due: Decimal
    status: Optional[str] = "upcoming"
    auto_pay: Optional[bool] = False


class BillUpdate(BaseModel):
    biller_name: Optional[str]
    due_date: Optional[date]
    amount_due: Optional[Decimal]
    status: Optional[str]
    auto_pay: Optional[bool]


class BillResponse(BaseModel):
    id: int
    user_id: int
    biller_name: str
    due_date: date
    amount_due: Decimal
    status: str
    auto_pay: bool
    created_at: datetime

    class Config:
        from_attributes = True
