from app.database import SessionLocal
from app.dashboard.service import get_dashboard_summary


def test_dashboard_summary():
    db = SessionLocal()

    try:
        user_id = 2  # existing user

        print("Fetching dashboard summary...")
        summary = get_dashboard_summary(db=db, user_id=user_id)

        print(summary)

        assert "total_balance" in summary
        assert "monthly_spent" in summary
        assert "budgets" in summary
        assert "alerts_count" in summary

        assert isinstance(summary["total_balance"], float)
        assert isinstance(summary["monthly_spent"], float)
        assert isinstance(summary["budgets"], list)
        assert isinstance(summary["alerts_count"], int)

    finally:
        db.close()


if __name__ == "__main__":
    test_dashboard_summary()
