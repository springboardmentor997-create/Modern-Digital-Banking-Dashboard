from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Literal, Optional
from datetime import date  


class BillPaymentCreate(BaseModel):
    bill_id: Optional[int] = None
    account_id: int
    amount: Decimal = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=4)

    bill_type: Literal[
        "electricity",
        "mobile_recharge",
        "fastag",
        "google_play",
        "subscription",
        "credit_card"
    ]

    reference_id: str
    provider: Optional[str] = None


class BillCreate(BaseModel):
    biller_name: str
    due_date: date
    amount_due: Decimal
    account_id: int
    auto_pay: bool = False

class BillUpdate(BaseModel):
    biller_name: Optional[str]
    due_date: Optional[date]
    amount_due: Optional[Decimal]
    auto_pay: Optional[bool]
    status: Optional[str]

class BillOut(BaseModel):
    id: int
    biller_name: str
    due_date: date
    amount_due: Decimal
    status: str
    auto_pay: bool
    account_id: int

    class Config:
        from_attributes = True