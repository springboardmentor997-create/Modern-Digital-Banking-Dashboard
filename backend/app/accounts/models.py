from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base


class AccountType(str, enum.Enum):
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
    account_type = Column(
        Enum(AccountType, name="account_type"),
        nullable=False
    )
    masked_account = Column(String(50), nullable=False)

    currency = Column(String(3), nullable=False)
    balance = Column(Numeric(12, 2), nullable=False, default=0)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = relationship("User", backref="accounts")
