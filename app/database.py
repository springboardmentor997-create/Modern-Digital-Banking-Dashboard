"""
Database Layer

What:
- Creates DB engine & session
- Provides Base for ORM models

Backend Connections:
- Used by:
  - models (User, Account, Transaction)
  - services (account_service, transaction_service)
  - routers (via Depends(get_db))

Frontend Connections:
- Indirect
- Any frontend page fetching data relies on this DB layer

Flow:
Frontend → Router → Service → database.py → PostgreSQL
"""



from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings


DATABASE_URL = settings.DATABASE_URL 

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
