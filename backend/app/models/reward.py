from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    program_name = Column(String, nullable=False)
    points_balance = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
