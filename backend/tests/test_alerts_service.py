from app.database import SessionLocal
from app.alerts.service import create_budget_exceeded_alert, get_alerts_for_user
from app.alerts.models import Alert


def test_create_alert():
    print("=== ALERT SERVICE TEST STARTED ===")

    db = SessionLocal()
    try:
        print("Creating budget exceeded alert...")

        alert = create_budget_exceeded_alert(
            db=db,
            user_id=2,  # existing user id
            category="Food",
            amount=500.0,
        )

        print(f"Alert created with ID: {alert.id}")
        print(f"Alert message: {alert.message}")

        alerts = get_alerts_for_user(db, user_id=2)
        print(f"Total alerts found for user 2: {len(alerts)}")

        assert isinstance(alert, Alert)
        assert alert.user_id == 2
        assert len(alerts) >= 1

        print("=== ALERT SERVICE TEST PASSED ===")

    finally:
        db.close()


# 👇 THIS IS THE MISSING PIECE
if __name__ == "__main__":
    test_create_alert()
