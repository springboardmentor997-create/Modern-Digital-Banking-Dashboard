from app.database import engine
from app.models.base import Base

# IMPORTANT: import models so SQLAlchemy sees them
import app.models
import app.bills.models

print("Creating missing tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
