from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

from app.budgets.models import BudgetPeriod


class BudgetCreate(BaseModel):
    category: str = Field(..., max_length=50)
    limit_amount: Decimal = Field(..., gt=0)
    period: BudgetPeriod = BudgetPeriod.monthly


class BudgetOut(BaseModel):
    id: int
    category: str
    limit_amount: Decimal
    period: BudgetPeriod
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetWithStats(BudgetOut):
    spent_amount: Decimal
    remaining_amount: Decimal
    is_exceeded: bool
