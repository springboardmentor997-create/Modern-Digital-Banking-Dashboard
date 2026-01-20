from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy import Boolean

class Budget(Base):
    __tablename__ = "budgets"

    is_active = Column(Boolean, default=True)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String, nullable=False)

    limit_amount = Column(Numeric(12, 2), nullable=False)
    spent_amount = Column(Numeric(12, 2), default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
