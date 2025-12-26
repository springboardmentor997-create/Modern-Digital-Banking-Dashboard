from app.database import SessionLocal
from app.dashboard.service import get_monthly_spending

USER_ID = 2  


def test_monthly_spending():
    db = SessionLocal()

    print("Calculating monthly spending...")
    result = get_monthly_spending(db, USER_ID)

    print("Result:", result)
    db.close()


if __name__ == "__main__":
    test_monthly_spending()
