from pydantic import BaseModel

class AccountCreate(BaseModel):
    bank_name: str
    account_type: str
    balance: float

class AccountOut(AccountCreate):
    id: int
    model_config = {
    "from_attributes": True
}
