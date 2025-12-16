from sqlalchemy import Column, Integer, String, Enum, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class KYCStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    dob = Column(Date, nullable=True)
    address = Column(String, nullable=True)
    pin_code = Column(String, nullable=True)

    kyc_status = Column(Enum(KYCStatus), nullable=False, server_default=KYCStatus.unverified.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    accounts = relationship(
        "Account",
        back_populates="user",
        cascade="all, delete"
    )
