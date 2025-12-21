#!/usr/bin/env python3
"""
Add a `role` column to the `users` table if it does not already exist.

Run from the project root or from `backend/` with:

    python add_role_column.py

This script reuses the project's `engine` from `app.database` and follows
the style of `ensure_db_and_tables.py` / `query_db.py`.
"""
import sys

sys.path.append('.')

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

try:
    from app.database import engine
    from app.config import settings
except Exception as e:
    print('Could not import project database/ config:', e)
    print('Run this from the project root so `backend` is on sys.path.')
    sys.exit(1)

print('Using DATABASE_URL:', getattr(settings, 'DATABASE_URL', '<unknown>'))

check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'")

alter_sql = text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';")

try:
    with engine.connect() as conn:
        r = conn.execute(check_sql)
        exists = r.fetchone() is not None
        if exists:
            print('Column "role" already exists on table "users". No action taken.')
        else:
            print('Adding "role" column to "users"...')
            conn.execute(alter_sql)
            # Some DBs require commit for DDL in transactional context
            try:
                conn.commit()
            except Exception:
                # commit may not be necessary or may be handled automatically
                pass
            print('Column added successfully.')
except SQLAlchemyError as e:
    print('SQLAlchemy error while altering table:', e)
    sys.exit(1)
except Exception as e:
    print('Unexpected error:', e)
    sys.exit(1)

print('Done')
