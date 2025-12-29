import enum
from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    String,
    Date,
    Boolean,
    Numeric,
    Enum,
    TIMESTAMP,
)
from sqlalchemy.sql import func

from app.models.base import Base


class BillFrequency(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=False)

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    due_date = Column(
        Date,
        nullable=False,
    )

    frequency = Column(
        Enum(BillFrequency, name="bill_frequency"),
        nullable=False,
    )

    is_paid = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
