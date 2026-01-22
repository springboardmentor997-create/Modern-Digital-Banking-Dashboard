from pydantic import BaseModel, field_validator
from decimal import Decimal
from typing import Optional
from datetime import datetime

class RewardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    points_required: int
    reward_type: str
    value: Decimal

    @field_validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Title must be at least 2 characters')
        return v.strip()

    @field_validator('points_required')
    def validate_points(cls, v):
        if v <= 0:
            raise ValueError('Points required must be greater than 0')
        return v

    @field_validator('value')
    def validate_value(cls, v):
        if v <= 0:
            raise ValueError('Value must be greater than 0')
        return v

class RewardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points_required: Optional[int] = None
    reward_type: Optional[str] = None
    value: Optional[Decimal] = None
    is_active: Optional[bool] = None

    @field_validator('title')
    def validate_title(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Title must be at least 2 characters')
        return v.strip() if v else v

    @field_validator('points_required')
    def validate_points(cls, v):
        if v and v <= 0:
            raise ValueError('Points required must be greater than 0')
        return v

    @field_validator('value')
    def validate_value(cls, v):
        if v and v <= 0:
            raise ValueError('Value must be greater than 0')
        return v

class RewardResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    points_required: int
    reward_type: str
    value: Decimal
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True