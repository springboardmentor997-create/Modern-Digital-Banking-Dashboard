from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    from_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    to_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # transfer, deposit, withdrawal, payment
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(Text, nullable=True)
    reference_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="completed")  # pending, completed, failed, cancelled
    fee = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="transactions")
    from_account = relationship("Account", foreign_keys=[from_account_id], back_populates="transactions_from")
    to_account = relationship("Account", foreign_keys=[to_account_id], back_populates="transactions_to")
