from datetime import datetime

from app.database import SessionLocal
from app.transactions.service import get_monthly_total_spent


def test_get_monthly_total_spent():
    db = SessionLocal()

    try:
        user_id = 2  # existing user id
        now = datetime.utcnow()

        print("Calculating monthly total spent...")
        total = get_monthly_total_spent(
            db=db,
            user_id=user_id,
            year=now.year,
            month=now.month,
        )

        print(f"Total spent this month: {total}")

        assert isinstance(total, float)
        assert total >= 0

    finally:
        db.close()
