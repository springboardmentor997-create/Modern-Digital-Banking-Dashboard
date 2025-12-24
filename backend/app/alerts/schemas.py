from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class AlertType(str, Enum):
    budget_exceeded = "budget_exceeded"


class AlertOut(BaseModel):
    id: int
    user_id: int
    type: AlertType
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
