from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AlertType(str, enum.Enum):
    low_balance = "low_balance"
    bill_due = "bill_due"
    budget_exceeded = "budget_exceeded"

class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(AlertType), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alerts")