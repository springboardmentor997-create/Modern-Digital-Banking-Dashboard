from pydantic import BaseModel
from datetime import datetime

class BudgetCreate(BaseModel):
    category: str
    amount: float
    period: str = "monthly" # e.g., 'monthly', 'weekly'

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    period: str
    created_at: datetime

    class Config:
        from_attributes = True