from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional, Literal


class TransferCreate(BaseModel):
    from_account_id: int = Field(..., example=1)
    amount: Decimal = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=4)

    transfer_type: Literal["bank", "self", "upi"]

    # BANK TRANSFER
    to_account_number: Optional[str] = None

    # SELF TRANSFER
    to_account_id: Optional[int] = None

    # UPI TRANSFER
    upi_id: Optional[str] = None


class TransferResponse(BaseModel):
    status: str
    message: str
