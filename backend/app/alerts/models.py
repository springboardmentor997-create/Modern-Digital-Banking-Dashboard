from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.sql import func
import enum

from app.models.base import Base


class AlertType(str, enum.Enum):
    budget_exceeded = "budget_exceeded"


class Alerts(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    type = Column(
        Enum(AlertType, name="alert_type"),
        nullable=False
    )

    message = Column(Text, nullable=False)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
