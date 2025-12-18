from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.db.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String(100))
    month = Column(Integer)
    year = Column(Integer)
    limit_amount = Column(Float)
    spent_amount = Column(Float, default=0)
