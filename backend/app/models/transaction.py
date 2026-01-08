from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class TxnType(str, enum.Enum):
    debit = "debit"
    credit = "credit"

class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    txn_type = Column(Enum(TxnType), nullable=False)
    category = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    merchant = Column(String(100), nullable=True)
    currency = Column(String(3), default="INR")
    txn_date = Column(DateTime(timezone=True), server_default=func.now())
    posted_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"))

    # Relationships
    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")