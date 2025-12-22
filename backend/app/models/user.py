from sqlalchemy import Column, Integer, String, TIMESTAMP, Enum
from sqlalchemy.sql import func
from .base import Base
import enum
from sqlalchemy import Enum

class KycStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"
    
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    auditor = "auditor"
    support = "support"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    kyc_status = Column(
        Enum(KycStatus, name="kyc_status"),
        nullable=False,
        default=KycStatus.unverified
    )
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    role = Column(
    Enum(UserRole, name="user_role"),
    nullable=False,
    default=UserRole.user
    )

