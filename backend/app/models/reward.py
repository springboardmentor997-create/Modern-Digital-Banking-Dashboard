from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Reward(Base):
    __tablename__ = "rewards"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String, nullable=False)
    points_balance = Column(Integer, default=0)
    given_by_admin = Column(Boolean, default=False)
    admin_message = Column(String, nullable=True)
    title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Link back to User
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="rewards")