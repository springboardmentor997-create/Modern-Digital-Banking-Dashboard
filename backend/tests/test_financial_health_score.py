from app.database import SessionLocal
from app.insights.service import get_financial_health_score


def test_financial_health_score():
    print("Running financial health score test...")

    db = SessionLocal()
    user_id = 2

    result = get_financial_health_score(db, user_id)

    print("Health score result:", result)

    assert "financial_health_score" in result
    assert 0 <= result["financial_health_score"] <= 100

    db.close()


if __name__ == "__main__":
    test_financial_health_score()
