# backend/app/schemas/admin.py

from pydantic import BaseModel
from typing import Optional, Literal
from app.schemas.kyc_schema import KYCStatusEnum



# ================================
# ADMIN → USERS LIST
# ================================

class AdminUserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    kyc_status: str

    class Config:
        from_attributes = True


# ================================
# ADMIN → SINGLE USER DETAIL
# ================================

class AdminUserDetailOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    kyc_status: str
    created_at: str

    class Config:
        from_attributes = True


class AdminKycUpdate(BaseModel):
    status: KYCStatusEnum