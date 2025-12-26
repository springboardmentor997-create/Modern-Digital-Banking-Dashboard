from app.database import SessionLocal
from app.budgets.service import trigger_budget_alerts
from app.alerts.service import get_alerts_for_user


def test_trigger_budget_alerts():
    db = SessionLocal()

    try:
        user_id = 2  # existing user id

        print("Triggering budget alerts...")
        alerts = trigger_budget_alerts(db=db, user_id=user_id)

        print(f"New alerts created: {len(alerts)}")

        all_alerts = get_alerts_for_user(db=db, user_id=user_id)
        print(f"Total alerts for user now: {len(all_alerts)}")

        # Alerts list may be empty if no budget exceeded
        assert isinstance(alerts, list)

    finally:
        db.close()


if __name__ == "__main__":
    test_trigger_budget_alerts()
