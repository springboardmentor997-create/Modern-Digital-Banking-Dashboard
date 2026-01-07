from pydantic import BaseModel, EmailStr, validator
from datetime import date, datetime
from typing import Optional

from ..utils.validators import is_strong_password, normalize_phone

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    dob: Optional[date] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None

    @validator("password")
    def check_password_strength(cls, v):
        if not is_strong_password(v):
            raise ValueError("Password must include upper, lower, digit, special char and be 8+ chars.")
        return v

    @validator("phone", pre=True)
    def validate_phone(cls, v):
        digits = normalize_phone(v)
        if len(digits) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return digits


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    dob: Optional[date]
    address: Optional[str]
    pin_code: Optional[str]
    kyc_status: str
    is_admin: bool
    last_login: Optional[datetime]

    # pydantic v2 replacement for orm_mode
    model_config = {"from_attributes": True}


# Backwards-compatible alias expected by routers earlier in the project
# (some code imports UserResponse). Both names can be used interchangeably.
class UserResponse(UserOut):
    pass
