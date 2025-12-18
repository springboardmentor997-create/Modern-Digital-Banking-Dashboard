from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ---------- INPUT SCHEMA ----------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=50)


# ---------- OUTPUT SCHEMA ----------
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    kyc_status: str
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- AUTH TOKEN SCHEMA ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
