from app.database import SessionLocal
from app.budgets.service import get_budget_vs_actual


def test_budget_vs_actual():
    db = SessionLocal()

    try:
        user_id = 2  # existing user id

        print("Calculating budget vs actual...")
        results = get_budget_vs_actual(db=db, user_id=user_id)

        print(f"Budgets found: {len(results)}")

        for item in results:
            print(item)

            assert "budget_id" in item
            assert "category" in item
            assert "limit" in item
            assert "spent" in item
            assert "remaining" in item
            assert "exceeded" in item

            assert isinstance(item["limit"], float)
            assert isinstance(item["spent"], float)
            assert isinstance(item["remaining"], float)
            assert isinstance(item["exceeded"], bool)

    finally:
        db.close()


if __name__ == "__main__":
    test_budget_vs_actual()
