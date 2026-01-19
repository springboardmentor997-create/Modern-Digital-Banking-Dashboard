"""Simple migration runner: executes the SQL in convert_txn_type.sql using the project's engine.

Usage (from backend/):
    .venv\Scripts\Activate
    python migrations\run_migration.py

This will load `app.database.engine` and run the SQL. It will print outcomes.
"""
from sqlalchemy import text
from app.database import engine
from pathlib import Path
import sys

SQL_PATH = Path(__file__).parent / "convert_txn_type.sql"

def main():
    if not SQL_PATH.exists():
        print("Migration SQL not found:", SQL_PATH)
        sys.exit(1)

    sql = SQL_PATH.read_text()

    print("Connecting to database and executing migration...")
    with engine.connect() as conn:
        try:
            conn.execute(text(sql))
            conn.commit()
            print("Migration executed successfully.")
        except Exception as e:
            print("Migration failed:", e)
            sys.exit(2)

if __name__ == '__main__':
    main()
