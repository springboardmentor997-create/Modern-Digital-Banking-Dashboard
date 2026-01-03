from sqlalchemy import Column, Integer, String, Date, Boolean, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=True)
    biller_name = Column(String(255), nullable=False)
    due_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(12, 2), nullable=False)
    status = Column(String(32), default="upcoming")
    auto_pay = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    def __repr__(self):
        return f"<Bill(id={self.id}, user_id={self.user_id}, biller={self.biller_name})>"
