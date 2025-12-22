from sqlalchemy import text
import os

print("DATABASE_URL seen by script:", os.getenv("DATABASE_URL"))

from app.database import engine

with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print("DB CONNECTION OK:", result.scalar())
