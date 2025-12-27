from app.database import SessionLocal
from app.dashboard.service import get_dashboard_budget_summary

def test_dashboard_budgets():
    db = SessionLocal()
    user_id = 2  # existing user

    print("Fetching dashboard budget summary...")
    result = get_dashboard_budget_summary(db, user_id)

    print("Result:", result)
    assert isinstance(result, list)

    db.close()
