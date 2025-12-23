from sqlalchemy import Column, Integer, String, VARCHAR, DateTime, NUMERIC, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.database import Base

class TxnTypeEnum(str, enum.Enum):
    debit = "debit"
    credit = "credit"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    description = Column(String(255))
    category = Column(String(100))
    amount = Column(NUMERIC(15, 2), nullable=False)
    currency = Column(VARCHAR(3), default="USD")
    txn_type = Column(String(50), nullable=False)
    merchant = Column(String(255))
    txn_date = Column(TIMESTAMP, nullable=False)
    posted_date = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, account_id={self.account_id}, amount={self.amount})>"
