from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_name = Column(String(255), nullable=False)
    points_balance = Column(Integer, default=0)
    group_id = Column(String(100), nullable=True)
    last_updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Reward(id={self.id}, user_id={self.user_id}, program={self.program_name})>"
