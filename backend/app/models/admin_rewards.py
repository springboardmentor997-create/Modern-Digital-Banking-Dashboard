from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, text
from app.database import Base
import enum


class RewardStatus(str, enum.Enum):
    pending = "Pending"
    active = "Active"


class AdminReward(Base):
    __tablename__ = "admin_rewards"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    description = Column(String)

    reward_type = Column(String, nullable=False)  # Cashback / Offer / Referral
    applies_to = Column(String, nullable=False)   # CSV: Savings,Debit,UPI
    value = Column(String, nullable=False)        # 5% / ₹100 / 50 points

    status = Column(
        Enum(RewardStatus),
        default=RewardStatus.pending,
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
