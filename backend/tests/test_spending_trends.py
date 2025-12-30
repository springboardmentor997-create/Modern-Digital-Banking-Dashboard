from app.database import SessionLocal
from app.transactions.service import get_monthly_spending_trend


def test_spending_trend():
    db = SessionLocal()
    user_id = 2

    print("Calculating monthly spending trend...")
    result = get_monthly_spending_trend(db, user_id)

    print("Result:", result)
    assert "trend" in result

    db.close()


if __name__ == "__main__":
    print("Running spending trends test...")
    test_spending_trend()
    print("Spending trends test passed.")
