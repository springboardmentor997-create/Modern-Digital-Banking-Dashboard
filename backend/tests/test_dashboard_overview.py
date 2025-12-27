from app.database import SessionLocal
from app.dashboard.service import get_dashboard_overview

def test_dashboard_overview():
    print("Fetching dashboard overview...")
    db = SessionLocal()
    user_id = 2  # your known test user

    result = get_dashboard_overview(db, user_id)

    print("Result:", result)

    assert "accounts" in result
    assert "monthly_spending" in result
    assert "budgets" in result

    db.close()


if __name__ == "__main__":
    test_dashboard_overview()
