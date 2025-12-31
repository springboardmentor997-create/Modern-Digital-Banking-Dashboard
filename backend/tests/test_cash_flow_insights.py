from app.database import SessionLocal
from app.insights.service import get_cash_flow

def test_cash_flow_insight():
    print("Running cash flow insight test...")
    db = SessionLocal()

    user_id = 2  # your known test user

    result = get_cash_flow(db, user_id)

    print("Cash flow result:", result.model_dump())

    assert "income" in result.model_dump()
    assert "expense" in result.model_dump()
    assert "net_cash_flow" in result.model_dump()
    assert "status" in result.model_dump()

    db.close()

if __name__ == "__main__":
    test_cash_flow_insight()
