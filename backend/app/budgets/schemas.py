from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class BudgetCreate(BaseModel):
	month: int
	year: int
	category: Optional[str] = None
	limit_amount: Decimal
	spent_amount: Optional[Decimal] = Decimal("0.0")


class BudgetUpdate(BaseModel):
	month: Optional[int] = None
	year: Optional[int] = None
	category: Optional[str] = None
	limit_amount: Optional[Decimal] = None
	spent_amount: Optional[Decimal] = None


class BudgetResponse(BaseModel):
	id: int
	user_id: int
	month: int
	year: int
	category: Optional[str]
	limit_amount: Decimal
	spent_amount: Decimal
	created_at: datetime

	class Config:
		from_attributes = True
