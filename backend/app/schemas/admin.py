# backend/app/schemas/admin.py

from pydantic import BaseModel
from typing import Optional, Literal


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
    status: Literal["approved", "rejected"]