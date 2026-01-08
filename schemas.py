from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from enum import Enum


class KYCStatusEnum(str, Enum):
    unverified = "unverified"
    pending = "pending"
    verified = "verified"
class KYCUserOut(BaseModel):
    id: int
    name: str | None
    email: str
    kyc_status: str

    class Config:
        from_attributes = True

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"
    auditor = "auditor"
    support = "support"


class UserCreate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    email: EmailStr
    password: str
    role: RoleEnum


class UserOut(BaseModel):
    id: int
    name: Optional[str]
    phone: Optional[str]
    email: EmailStr
    kyc_status: KYCStatusEnum
    created_at: datetime
    role: RoleEnum

    class Config:
        from_attributes = True   # ✅ FIXED


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: RoleEnum


class UpdateProfile(BaseModel):
    name: str
    phone: Optional[str] = None


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class BudgetCreate(BaseModel):
    amount: int


class BillCreate(BaseModel):
    title: str
    amount: float
    due_date: date


class BillOut(BaseModel):
    id: int
    title: str
    amount: float
    due_date: date
    is_paid: bool

    class Config:
        from_attributes = True
