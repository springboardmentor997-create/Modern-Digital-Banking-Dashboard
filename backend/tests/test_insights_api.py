from app.database import SessionLocal
from app.insights.service import get_spending_insights


def test_spending_insights():
    db = SessionLocal()
    user_id = 2

    print("Fetching spending insights...")
    result = get_spending_insights(db, user_id)

    print("Result:", result)
    assert "monthly_spending" in result
    assert "trend" in result

    db.close()


if __name__ == "__main__":
    print("Running insights API test...")
    test_spending_insights()
    print("Insights API test passed.")
