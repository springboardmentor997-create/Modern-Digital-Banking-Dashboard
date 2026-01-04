from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=200)
    message: str
    scheduled_date: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    scheduled_date: Optional[datetime]
    sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
