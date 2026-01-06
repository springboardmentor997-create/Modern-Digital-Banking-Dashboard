from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BaseResponse(BaseModel):
    """Base response model with common fields"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    """Standard message response"""
    message: str
    status: str = "success"

class PaginationParams(BaseModel):
    """Common pagination parameters"""
    page: int = 1
    limit: int = 10
    
class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: list
    total: int
    page: int
    limit: int
    pages: int