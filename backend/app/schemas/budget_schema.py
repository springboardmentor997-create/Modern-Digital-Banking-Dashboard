from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    category: str
    limit: float
    period: Optional[str] = "Monthly"
    color: Optional[str] = "bg-sky-500"

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    spent: float
    created_at: datetime

    class Config:
        from_attributes = True
