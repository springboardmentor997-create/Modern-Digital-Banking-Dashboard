from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from app.db.database import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Float)
    category = Column(String)
    description = Column(String)
    txn_date = Column(DateTime, default=datetime.datetime.utcnow)
