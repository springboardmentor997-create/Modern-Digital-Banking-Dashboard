"""
Account ORM Model

What:
- Stores bank account details
- Stores transaction PIN (hashed)

Backend Connections:
- Used by:
  - accounts router
  - account_service
  - transactions router

Frontend Connections:
- Accounts.jsx → add/list accounts
- SendMoney.jsx → select account
- PIN entered during payment is matched
  against PIN created here
"""




from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from sqlalchemy import Boolean


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False)
    masked_account = Column(String(20), nullable=False)

    currency = Column(String(3), default="INR")
    balance = Column(Numeric(12, 2), default=0)

    # 🔐 ADD THIS
    pin_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)


    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="accounts")
