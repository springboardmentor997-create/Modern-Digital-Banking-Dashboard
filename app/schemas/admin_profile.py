from pydantic import BaseModel, EmailStr
from typing import Optional


class AdminProfileOut(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]

    class Config:
        from_attributes = True


class AdminProfileUpdate(BaseModel):
    name: str
    phone: Optional[str]


class AdminChangePassword(BaseModel):
    current_password: str
    new_password: str
