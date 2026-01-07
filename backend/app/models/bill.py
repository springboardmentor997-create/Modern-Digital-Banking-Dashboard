"""
Bill Model

What:
- Stores user bills
- Used for bill payments & reminders

Backend Connections:
- bills.service
- bill_reminders task
"""

from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    biller_name = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(12, 2), nullable=False)

    status = Column(
        String,
        default="upcoming"  # upcoming | paid | overdue
    )

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
            nullable=False
    )


    auto_pay = Column(Boolean, default=False)

    user = relationship("User")
    account = relationship("Account")
