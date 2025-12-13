from sqlalchemy import Column, Integer, String, VARCHAR, Enum, DateTime, TIMESTAMP
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.database import Base

class KycStatusEnum(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    kyc_status = Column(Enum(KycStatusEnum), default=KycStatusEnum.unverified)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
