from app.database import engine
from app.models.base import Base

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
