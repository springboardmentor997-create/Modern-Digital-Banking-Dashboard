from app.database import SessionLocal
from app.insights.service import get_burn_rate


def test_burn_rate():
    print("Running burn rate insight test...")

    db = SessionLocal()
    user_id = 2  # your real existing user

    result = get_burn_rate(db, user_id)

    print("Burn rate result:", result)

    assert "daily_burn_rate" in result
    assert "projected_monthly_spend" in result

    db.close()


if __name__ == "__main__":
    test_burn_rate()
