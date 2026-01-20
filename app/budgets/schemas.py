from pydantic import BaseModel
from decimal import Decimal

class BudgetCreate(BaseModel):
    month: int
    year: int
    category: str
    limit_amount: Decimal

class BudgetResponse(BaseModel):
    id: int
    month: int
    year: int
    category: str
    limit_amount: Decimal
    spent_amount: Decimal

    class Config:
        from_attributes = True

class BudgetUpdate(BaseModel):
    limit_amount: Decimal
