"""
Transaction Model

What:
- Stores transaction records
- Success / failure status

Backend Connections:
- Used by:
  - transactions.service
  - reports / exports

Frontend Connections:
- Transactions.jsx
- PaymentSuccess.jsx
- PaymentFailed.jsx
"""




from sqlalchemy import Column, Integer, String, Numeric, Enum, Date, ForeignKey, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    debit = "debit"
    credit = "credit"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    description = Column(String, nullable=False)
    category = Column(String, default="Uncategorized")
    merchant = Column(String, nullable=True)

    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="INR")

    txn_type = Column(Enum(TransactionType), nullable=False)
    txn_date = Column(Date, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    user = relationship("User")
    account = relationship("Account")
