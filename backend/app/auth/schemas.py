from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from typing import List

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    kyc_status: str
    accounts: Optional[List[dict]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
