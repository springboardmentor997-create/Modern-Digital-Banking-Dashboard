from pydantic import BaseModel
from datetime import datetime
from pydantic import BaseModel


class AdminUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    kyc_status: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserStatusUpdate(BaseModel):
    is_active: bool
