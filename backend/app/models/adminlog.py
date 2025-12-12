# backend/app/models/adminlog.py
from sqlalchemy import Column, Integer, ForeignKey, Text, String, TIMESTAMP
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import func

class AdminLog(Base):
    __tablename__ = "admin_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(Text, nullable=True)
    target_type = Column(String(255), nullable=True)
    target_id = Column(Integer, nullable=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    admin = relationship("User", backref="admin_logs", passive_deletes=True)
