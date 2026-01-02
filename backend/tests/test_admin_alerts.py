from app.admin.service import get_all_alerts
from app.database import SessionLocal


def test_admin_get_all_alerts():
    db = SessionLocal()

    alerts = get_all_alerts(db)

    print("Total alerts:", len(alerts))
    assert isinstance(alerts, list)

    db.close()


if __name__ == "__main__":
    test_admin_get_all_alerts()
