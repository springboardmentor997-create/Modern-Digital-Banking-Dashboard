from pydantic import BaseModel
from datetime import datetime

class AccountCreate(BaseModel):
    name: str              # Matches frontend payload
    account_number: str    # Matches frontend payload
    type: str              # Matches frontend payload
    balance: float         # Matches frontend payload
    status: str = "active" # Matches frontend payload

class AccountResponse(BaseModel):
    id: int
    user_id: int
    name: str
    account_number: str
    type: str
    balance: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True