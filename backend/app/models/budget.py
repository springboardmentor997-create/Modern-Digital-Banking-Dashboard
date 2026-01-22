from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="budgets")
    name = Column(String, nullable=True)  
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    category_id = Column(Integer, nullable=False) 
    limit_amount = Column(Numeric(15, 2), nullable=False)  # Match DB column name
    spent_amount = Column(Numeric(15, 2), default=0.00)   # Match DB column name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Properties to maintain compatibility with existing code
    @property
    def amount(self):
        return self.limit_amount
    
    @amount.setter
    def amount(self, value):
        self.limit_amount = value
    
    @property
    def spent(self):
        return self.spent_amount
    
    @spent.setter
    def spent(self, value):
        self.spent_amount = value
    
    def remaining(self):
        return self.limit_amount - self.spent_amount