from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.database import Base

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
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    user = relationship("User", back_populates="accounts")
