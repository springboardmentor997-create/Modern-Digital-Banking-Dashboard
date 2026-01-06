from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
