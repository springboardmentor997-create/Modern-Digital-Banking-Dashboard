from app.database import SessionLocal
from app.transactions.service import get_monthly_spending_by_category


def test_spending_by_category():
    db = SessionLocal()
    user_id = 2

    print("Calculating spending by category...")
    results = get_monthly_spending_by_category(db, user_id)

    print("Result:", results)
    assert isinstance(results, list)

    db.close()


if __name__ == "__main__":
    print("Running spending insights test...")
    test_spending_by_category()
    print("Spending insights test passed.")
