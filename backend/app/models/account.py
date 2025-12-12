from sqlalchemy import Column, Integer, String, VARCHAR, Enum, DateTime, NUMERIC, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.database import Base

class AccountTypeEnum(str, enum.Enum):
    savings = "savings"
    checking = "checking"
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bank_name = Column(String(255), nullable=False)
    account_type = Column(Enum(AccountTypeEnum), nullable=False)
    masked_account = Column(String(255))
    currency = Column(VARCHAR(3), default="USD")
    balance = Column(NUMERIC(15, 2), default=0.0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __repr__(self):
        return f"<Account(id={self.id}, user_id={self.user_id}, bank={self.bank_name})>"
