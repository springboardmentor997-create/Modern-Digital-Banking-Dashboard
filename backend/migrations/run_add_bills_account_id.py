"""Run the add_bills_account_id.sql migration using the project's engine.

Usage (from backend/):
    .venv\Scripts\Activate
    python migrations\run_add_bills_account_id.py
"""
from sqlalchemy import text
from app.database import engine
from pathlib import Path
import sys

SQL_PATH = Path(__file__).parent / "add_bills_account_id.sql"


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
