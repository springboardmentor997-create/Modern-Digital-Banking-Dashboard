import enum
from sqlalchemy import Column, Integer, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func

from app.models.base import Base


class AlertType(str, enum.Enum):
    budget_exceeded = "budget_exceeded"
    bill_due = "bill_due"
    system = "system"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(
        Enum(AlertType, name="alert_type"),
        nullable=False,
        default=AlertType.system,
    )

    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
