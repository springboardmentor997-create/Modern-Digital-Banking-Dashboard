"""
Account Model

What:
- Represents bank accounts in database
- Stores account number, bank name, PIN hash

Backend Connections:
- Used by:
  - accounts.router
  - transactions.service

Frontend Connections:
- AddAccount.jsx → creates account
- Accounts.jsx → lists accounts
- SendMoney.jsx → selects account
"""


from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    bank_name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)
    masked_account = Column(String, nullable=False)

    currency = Column(String(3), default="INR")
    balance = Column(Numeric(12, 2), default=0)

    # 🔐 ACCOUNT PIN (HASHED)
    pin_hash = Column(String(255), nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    user = relationship("User")
