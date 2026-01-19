"""
Ensure the Postgres database exists and create tables using SQLAlchemy metadata.
Run from workspace root with your Python environment:

PowerShell example:
C:/Users/ASUS/AppData/Local/Microsoft/WindowsApps/python3.11.exe backend/ensure_db_and_tables.py

This script will:
- Read `DATABASE_URL` from `app.config.settings` or use the default in config.py
- Connect to the server's `postgres` database and create the target DB if missing
- Use SQLAlchemy `Base.metadata.create_all` to create tables
"""
import sys
import time
from urllib.parse import urlparse

try:
    from app.config import settings
    from app.database import Base
except Exception as e:
    print('Could not import app settings or Base:', e)
    print('Make sure you run this from the project root where `backend` is on sys.path.')
    sys.exit(1)

DATABASE_URL = settings.DATABASE_URL
print('Using DATABASE_URL:', DATABASE_URL)

# parse URL
url = urlparse(DATABASE_URL)
username = url.username or 'postgres'
password = url.password or ''
host = url.hostname or 'localhost'
port = url.port or 5432
path = url.path.lstrip('/')
if not path:
    print('Could not determine database name from DATABASE_URL')
    sys.exit(1)

target_db = path

print(f'Target DB: {target_db} @ {host}:{port} (user={username})')

# Connect to postgres database to create target DB if missing
try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except Exception as e:
    print('psycopg2 not installed. Install requirements with `pip install -r backend/requirements.txt`')
    print(e)
    sys.exit(1)

try:
    conn = psycopg2.connect(dbname='postgres', user=username, password=password, host=host, port=port)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
    exists = cur.fetchone() is not None
    if exists:
        print(f'Database "{target_db}" already exists')
    else:
        print(f'Database "{target_db}" not found — creating...')
        cur.execute(f'CREATE DATABASE "{target_db}"')
        print('Database created')
    cur.close()
    conn.close()
except Exception as e:
    print('Error checking/creating database:', e)
    sys.exit(1)

# Wait a moment for server to register new DB
time.sleep(1)

# Create tables using SQLAlchemy
try:
    from sqlalchemy import create_engine
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    print('Creating tables (if not exist) using Base.metadata.create_all...')
    Base.metadata.create_all(bind=engine)
    print('Tables created / ensured')
except Exception as e:
    print('Error creating tables:', e)
    sys.exit(1)

print('Done')
