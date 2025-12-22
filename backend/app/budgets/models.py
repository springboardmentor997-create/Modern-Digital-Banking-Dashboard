from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
    TIMESTAMP,
    Enum,
    String,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base


class BudgetPeriod(str, enum.Enum):
    monthly = "monthly"
    yearly = "yearly"


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = Column(String(50), nullable=False)
    limit_amount = Column(Numeric(12, 2), nullable=False)

    period = Column(
        Enum(BudgetPeriod, name="budget_period"),
        nullable=False,
        default=BudgetPeriod.monthly
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = relationship("User", backref="budgets")
