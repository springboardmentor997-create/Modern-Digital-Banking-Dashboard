from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class KYCStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    auditor = "auditor"
    support = "support"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    role = Column(Enum(UserRole), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- RELATIONSHIPS ---
    accounts = relationship("Account", back_populates="user", primaryjoin="User.id==Account.user_id")
    alerts = relationship("Alert", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    rewards = relationship("Reward", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    bills = relationship("Bill", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    kyc_documents = relationship("KYCDocument", back_populates="user", foreign_keys="KYCDocument.user_id")