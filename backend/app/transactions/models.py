from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    Date,
    ForeignKey,
    TIMESTAMP,
    Enum,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"


class TransactionCategory(str, enum.Enum):
    food = "food"
    rent = "rent"
    utilities = "utilities"
    salary = "salary"
    shopping = "shopping"
    travel = "travel"
    entertainment = "entertainment"
    health = "health"
    education = "education"
    other = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    amount = Column(Numeric(12, 2), nullable=False)
    transaction_type = Column(
        Enum(TransactionType, name="transaction_type"),
        nullable=False,
    )
    category = Column(
        Enum(TransactionCategory, name="transaction_category"),
        nullable=False,
    )

    description = Column(String, nullable=True)
    transaction_date = Column(Date, nullable=False)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", backref="transactions")
    account = relationship("Account", backref="transactions")
