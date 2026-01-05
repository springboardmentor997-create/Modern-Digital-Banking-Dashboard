from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.utils.validation import validate_user_ids


class RewardCreate(BaseModel):
    program_name: str
    points_balance: int = 0
    # Optional: assign this reward to a specific user (admin only)
    user_id: Optional[int] = None
    # Optional: credit a particular account when creating the reward
    account_id: Optional[int] = None


class RewardBulkCreate(BaseModel):
    program_name: str
    points_balance: int = 0
    user_ids: List[int] = Field(..., min_items=1)


class RewardBulkAssign(BaseModel):
    program_name: str = Field(..., min_length=1)
    points_balance: float = Field(..., gt=0)
    user_ids: List[int] = Field(..., min_items=1)

    @validator('user_ids')
    def ensure_ids_non_empty(cls, v):
        if not v:
            raise ValueError('user_ids must contain at least one id')
        return v

    def check_ids_exist(self, db: Session):
        # Perform DB-backed validation using utility functions; will raise HTTPException(422) on failure
        validate_user_ids(db, self.user_ids)
        return True


class RewardUpdate(BaseModel):
    program_name: Optional[str]
    points_balance: Optional[int]
    # Optional: allow reassigning reward to a different user (admin only)
    user_id: Optional[int]


class RewardResponse(BaseModel):
    id: int
    user_id: int
    program_name: str
    points_balance: float
    last_updated: datetime

    class Config:
        from_attributes = True
