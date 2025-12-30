from pydantic import BaseModel, Field
from datetime import datetime


class RewardBase(BaseModel):
    title: str = Field(..., max_length=100)
    reason: str = Field(..., max_length=255)
    points: int = Field(..., ge=0)


class RewardCreate(RewardBase):
    user_id: int


class RewardOut(RewardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
