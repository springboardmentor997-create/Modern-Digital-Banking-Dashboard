from pydantic import BaseModel
from typing import List
from datetime import datetime


class AdminRewardCreate(BaseModel):
    name: str
    description: str | None = None
    reward_type: str
    applies_to: List[str]
    value: str


class AdminRewardResponse(BaseModel):
    id: int
    name: str
    description: str | None
    reward_type: str
    applies_to: List[str]
    value: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
