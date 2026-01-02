from app.admin.service import get_system_summary
from app.database import SessionLocal


def test_admin_system_summary():
    db = SessionLocal()

    summary = get_system_summary(db)
    print("System summary:", summary)

    assert "total_users" in summary
    assert "total_accounts" in summary
    assert "total_transactions" in summary
    assert "total_alerts" in summary

    db.close()


if __name__ == "__main__":
    test_admin_system_summary()
