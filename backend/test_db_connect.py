from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import traceback
import sys

sys.path.append('.')
try:
    from app.config import settings
    database_url = settings.DATABASE_URL
except Exception as e:
    database_url = None
    print('Could not import settings:', e)

print('Using DATABASE_URL:', database_url)

if database_url:
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
else:
    print('No DATABASE_URL available to test.')
