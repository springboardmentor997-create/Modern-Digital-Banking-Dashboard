from pydantic import BaseModel

class CashFlowOut(BaseModel):
    month: str
    income: float
    expense: float
    net_cash_flow: float
    status: str

    class Config:
        from_attributes = True
