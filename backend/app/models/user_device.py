from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class UserDevice(Base):
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_token = Column(String, unique=True, nullable=False)
    platform = Column(String)  # android / ios
