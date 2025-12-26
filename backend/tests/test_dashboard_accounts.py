from app.database import SessionLocal
from app.dashboard.service import get_account_summary

USER_ID = 2  # confirmed existing user


def test_account_summary():
    db = SessionLocal()

    print("Fetching account summary...")
    summary = get_account_summary(db, USER_ID)

    print("Result:", summary)
    db.close()


if __name__ == "__main__":
    test_account_summary()
