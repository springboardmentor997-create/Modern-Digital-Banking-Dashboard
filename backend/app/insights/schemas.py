from pydantic import BaseModel
from typing import List

class CashFlowOut(BaseModel):
    month: str
    income: float
    expense: float
    net_cash_flow: float
    status: str

    class Config:
        from_attributes = True


class TopMerchantItem(BaseModel):
    merchant: str
    total_spent: float


class TopMerchantsOut(BaseModel):
    month: str
    top_merchants: List[TopMerchantItem]

    class Config:
        from_attributes = True
