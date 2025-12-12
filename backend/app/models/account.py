# backend/app/models/account.py
from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class AccountType(str, enum.Enum):
    savings = "savings"
    checking = "checking"
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name = Column(String(255), nullable=True)
    account_type = Column(Enum(AccountType, name="account_type"), nullable=True)
    masked_account = Column(String(100), nullable=True)
    currency = Column(String(3), nullable=False, default="USD", index=True)
    balance = Column(Numeric(18, 4), nullable=False, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="accounts", passive_deletes=True)
