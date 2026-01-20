from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timedelta
from app.database import Base

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, index=True)  # email or phone
    otp = Column(String)
    expires_at = Column(DateTime)

    @staticmethod
    def expiry():
        return datetime.utcnow() + timedelta(minutes=2)
