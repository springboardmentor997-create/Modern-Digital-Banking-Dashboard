from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AccountBase(BaseModel):
    name: str
    account_number: str
    type: str
    balance: float
    status: Optional[str] = "active"

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
