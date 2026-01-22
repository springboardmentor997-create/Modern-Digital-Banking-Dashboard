from pydantic import BaseModel, Field, field_validator, model_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional

class BudgetCreate(BaseModel):
    name: str
    amount: float
    category_id: int
    month: int
    year: int
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

    @field_validator('month')
    @classmethod
    def validate_month(cls, v: int) -> int:
        if not 1 <= v <= 12:
            raise ValueError('Month must be between 1 and 12')
        return v

    @field_validator('year')
    @classmethod
    def validate_year(cls, v: int) -> int:
        current_year = datetime.now().year
        if not (current_year - 1) <= v <= (current_year + 5):
            raise ValueError(f'Year must be between {current_year - 1} and {current_year + 5}')
        return v

class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    month: Optional[int] = None
    year: Optional[int] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip() if v else v

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError('Amount must be positive')
        return v

class BudgetResponse(BaseModel):
    id: int
    name: str
    category_id: int
    category: str = "General"  # Category name for display
    amount: float
    spent: float = 0.0
    month: int
    year: int
    created_at: datetime
    
    # These fields will be populated by the model_validator
    remaining_amount: float = 0.0
    percentage_used: float = 0.0
    category_name: Optional[str] = None  # Alias for frontend compatibility
    
    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def calculate_computed_fields(self) -> 'BudgetResponse':
        """Automatically calculates remaining amount and percentage after the model is initialized."""
        self.remaining_amount = round(self.amount - self.spent, 2)
        
        if self.amount > 0:
            self.percentage_used = round((self.spent / self.amount) * 100, 2)
        else:
            self.percentage_used = 0.0
        
        # Set category_name as alias for category for frontend compatibility
        if not self.category_name:
            self.category_name = self.category
            
        return self