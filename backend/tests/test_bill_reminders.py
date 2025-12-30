from app.database import SessionLocal
from app.bills.service import generate_bill_due_alerts
from app.alerts.models import Alert, AlertType


def test_bill_due_alerts():
    db = SessionLocal()
    user_id = 2  # YOUR existing user

    print("Generating bill due alerts...")
    alerts = generate_bill_due_alerts(db, user_id)

    stored = (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.type == AlertType.bill_due
        )
        .all()
    )

    print("Alerts created:", len(stored))
    db.close()


if __name__ == "__main__":
    test_bill_due_alerts()
