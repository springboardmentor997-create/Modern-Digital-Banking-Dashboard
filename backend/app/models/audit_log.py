from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)

    admin_name = Column(String, nullable=False)
    action = Column(String, nullable=False)

    target_type = Column(String)
    target_id = Column(Integer)
    details = Column(String)

    timestamp = Column(DateTime(timezone=True), server_default=func.now())
