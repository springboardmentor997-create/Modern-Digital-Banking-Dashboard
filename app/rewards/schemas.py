from pydantic import BaseModel
from datetime import datetime

class RewardBase(BaseModel):
    program_name: str


class RewardCreate(RewardBase):
    points_balance: int = 0


class RewardResponse(RewardBase):
    id: int
    points_balance: int
    last_updated: datetime

    class Config:
        from_attributes = True
