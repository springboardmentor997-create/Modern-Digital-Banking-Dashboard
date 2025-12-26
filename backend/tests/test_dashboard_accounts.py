from app.database import SessionLocal
from app.dashboard.service import get_account_summary

USER_ID = 3  


def test_account_summary():
    db = SessionLocal()

    print("Fetching account summary...")
    summary = get_account_summary(db, USER_ID)

    print(summary)
    db.close()
