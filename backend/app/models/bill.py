from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date
from app.db.database import Base

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    biller_name = Column(String(150))
    due_date = Column(Date)
    amount_due = Column(Float)
    status = Column(String(50))
