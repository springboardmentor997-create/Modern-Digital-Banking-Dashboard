import sys
sys.path.append('.')
from urllib.parse import urlparse

try:
    from app.config import settings
    database_url = settings.DATABASE_URL
except Exception:
    database_url = "postgresql://postgres:NewStrongPass123@localhost:5432/BANK"

print('Using DATABASE_URL:', database_url)

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

try:
    engine = create_engine(database_url, pool_pre_ping=True)
    with engine.connect() as conn:
        print('\n-- Users (up to 5)')
        r = conn.execute(text('SELECT id, email, name FROM users ORDER BY id DESC LIMIT 5'))
        rows = r.fetchall()
        if rows:
            for row in rows:
                print(row)
        else:
            print('No users found')

        print('\n-- Transactions (up to 5)')
        r2 = conn.execute(text('SELECT id, account_id, amount, txn_date FROM transactions ORDER BY created_at DESC LIMIT 5'))
        rows2 = r2.fetchall()
        if rows2:
            for row in rows2:
                print(row)
        else:
            print('No transactions found')
except SQLAlchemyError as e:
    print('SQLAlchemy error:', e)
    sys.exit(1)
except Exception as e:
    print('Error:', e)
    sys.exit(1)
