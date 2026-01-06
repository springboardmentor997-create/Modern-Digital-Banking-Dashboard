from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AccountType(str, enum.Enum):
    checking = "checking"
    savings = "savings"
    current = "current"
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"

class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    account_type = Column(Enum(AccountType), nullable=False)
    account_number = Column(String, nullable=True)
    masked_account = Column(String, nullable=True)
    currency = Column(String(3), default="INR")
    balance = Column(Numeric(15, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    # Explicit foreign_keys set to avoid ambiguous joins after adding active_account_id on User
    user = relationship("User", back_populates="accounts", foreign_keys=[user_id])
    transactions = relationship("Transaction", back_populates="account")