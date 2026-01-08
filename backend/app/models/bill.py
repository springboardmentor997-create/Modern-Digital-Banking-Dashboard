from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, Numeric, DateTime, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class BillStatus(str, enum.Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"

class Bill(Base):
    __tablename__ = "bills"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    biller_name = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(BillStatus), default=BillStatus.upcoming)
    auto_pay = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Key
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="bills")