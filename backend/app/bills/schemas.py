from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import validator


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
    account_id: Optional[int]

    @validator("due_date", pre=True)
    def _coerce_due_date(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            # Accept ISO date strings or full datetime strings
            try:
                return date.fromisoformat(v)
            except Exception:
                try:
                    return datetime.fromisoformat(v).date()
                except Exception:
                    raise ValueError("Invalid date format; expected YYYY-MM-DD")
        return v

    @validator("amount_due", pre=True)
    def _coerce_amount_due(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            try:
                return Decimal(v)
            except Exception:
                raise ValueError("Invalid numeric format for amount_due")
        return v


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
