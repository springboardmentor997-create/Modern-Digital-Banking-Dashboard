from app.database import SessionLocal
from app.insights.service import get_financial_health_score


def test_insights_access():
    print("Testing insights access (service-level)...")

    db = SessionLocal()
    user_id = 2

    result = get_financial_health_score(db, user_id)

    print("Result:", result)
    assert "financial_health_score" in result

    db.close()


if __name__ == "__main__":
    test_insights_access()
