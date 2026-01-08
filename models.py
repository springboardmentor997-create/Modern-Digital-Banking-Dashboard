from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,          # ✅ MUST be imported
    DateTime,
    ForeignKey,
    Float,
    Date,
    Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime
class KYCStatusEnum(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

# ================= USER =================
class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"
    auditor = "auditor"
    support = "support"
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(
        Enum(RoleEnum),
        default=RoleEnum.user,
        nullable=False
    )

    is_active = Column(Integer, default=1) 
    kyc_status = Column(
        Enum(KYCStatusEnum, name="kyc_status_enum"),
        default=KYCStatusEnum.unverified,
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ✅ REQUIRED FOR TRANSACTIONS
    transactions_sent = relationship(
        "Transaction",
        foreign_keys="Transaction.sender_id",
        back_populates="sender"
    )

    transactions_received = relationship(
        "Transaction",
        foreign_keys="Transaction.receiver_id",
        back_populates="receiver"
    )

    # ✅ ACCOUNTS
    accounts = relationship("Account", back_populates="user")

# ================= TRANSACTION =================
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    amount = Column(Float, nullable=False)
    message = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="transactions_sent"
    )
    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="transactions_received"
    )


# ================= BUDGET =================
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_type = Column(String, default="Savings")
    balance = Column(Integer, default=0)
    status = Column(String, default="Active")

    user = relationship("User", back_populates="accounts")
    cards = relationship("Card", back_populates="account")
class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    card_type = Column(String, default="Debit")
    last4 = Column(String)
    expiry = Column(String)
    network = Column(String, default="VISA")

    account = relationship("Account", back_populates="cards")
class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)          # Electricity, Rent, etc.
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)

    is_paid = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # cash / coupon
    title = Column(String)
    amount = Column(Integer, nullable=True)
    coupon = Column(String, nullable=True)
    is_redeemed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    type = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
