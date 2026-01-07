from sqlalchemy import Column, Integer, Boolean, ForeignKey
from  app.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    push_notifications = Column(Boolean, default=True)
    email_alerts = Column(Boolean, default=True)
    login_alerts = Column(Boolean, default=True)
    two_factor_enabled = Column(Boolean, default=False)
