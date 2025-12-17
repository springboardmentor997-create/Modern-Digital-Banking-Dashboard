from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False)
    masked_account = Column(String(20), nullable=False)

    currency = Column(String(3), default="INR")
    balance = Column(Numeric(12, 2), default=0)

    created_at = Column(
    DateTime,
    default=datetime.utcnow
    )
    user = relationship("User", back_populates="accounts")
