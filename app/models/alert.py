"""
Alert Model

What:
- Stores system alerts & reminders

Used by:
- bill_reminders
- alerts module
"""

from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(String, nullable=False)   # bill_due, low_balance, etc
    message = Column(String, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    user = relationship("User")
