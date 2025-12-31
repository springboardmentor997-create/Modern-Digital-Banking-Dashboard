from app.database import SessionLocal
from app.insights.service import get_top_merchants

def test_top_merchants_insight():
    print("Running top merchants insight test...")
    db = SessionLocal()

    user_id = 2

    result = get_top_merchants(db, user_id)

    print("Top merchants result:", result.model_dump())

    assert "month" in result.model_dump()
    assert "top_merchants" in result.model_dump()

    db.close()

if __name__ == "__main__":
    test_top_merchants_insight()
