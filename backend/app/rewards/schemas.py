from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RewardCreate(BaseModel):
    program_name: str
    points_balance: int = 0
    # Optional: assign this reward to a specific user (admin only)
    user_id: Optional[int] = None
    # Optional: credit a particular account when creating the reward
    account_id: Optional[int] = None


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
