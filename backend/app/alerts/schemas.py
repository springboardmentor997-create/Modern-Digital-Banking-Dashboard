from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
from enum import Enum

class AlertType(str, Enum):
    BUDGET_EXCEEDED = "budget_exceeded"
    LOW_BALANCE = "low_balance"
    LARGE_TRANSACTION = "large_transaction"
    BILL_DUE = "bill_due"
    GOAL_ACHIEVED = "goal_achieved"

class AlertCreate(BaseModel):
    alert_type: AlertType
    title: str
    message: str
    threshold_amount: Optional[Decimal] = None
    
    @field_validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Title must be at least 3 characters')
        return v.strip()

    @field_validator('message')
    def validate_message(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Message must be at least 5 characters')
        return v.strip()

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    threshold_amount: Optional[Decimal] = None
    is_active: Optional[bool] = None

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    title: str
    message: str
    threshold_amount: Optional[Decimal]
    is_active: bool
    is_read: bool
    triggered_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertMarkRead(BaseModel):
    is_read: bool = True