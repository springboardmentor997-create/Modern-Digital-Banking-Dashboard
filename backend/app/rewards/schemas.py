from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RewardCreate(BaseModel):
    program_name: str
    points_balance: int = 0


class RewardUpdate(BaseModel):
    program_name: Optional[str]
    points_balance: Optional[int]


class RewardResponse(BaseModel):
    id: int
    user_id: int
    program_name: str
    points_balance: int
    last_updated: datetime

    class Config:
        from_attributes = True
