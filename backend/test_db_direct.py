from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import traceback

# default from app/config.py
database_url = "postgresql://postgres:NewStrongPass123@localhost:5432/BANK"
print('Testing direct DATABASE_URL:', database_url)

try:
    engine = create_engine(database_url, pool_pre_ping=True)
    with engine.connect() as conn:
        res = conn.execute('SELECT 1')
        print('SELECT 1 ->', list(res))
except SQLAlchemyError as e:
    print('SQLAlchemy error:')
    print(str(e))
    traceback.print_exc()
except Exception as e:
    print('Other error:')
    print(str(e))
    traceback.print_exc()
