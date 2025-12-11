from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base
import enum

class KYCStatusEnum(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    kyc_status = Column(Enum(KYCStatusEnum), default=KYCStatusEnum.unverified)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
