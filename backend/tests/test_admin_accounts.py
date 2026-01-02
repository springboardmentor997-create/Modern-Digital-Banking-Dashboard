from app.admin.service import get_all_accounts
from app.database import SessionLocal


def test_admin_get_all_accounts():
    db = SessionLocal()

    accounts = get_all_accounts(db)

    print("Total accounts:", len(accounts))
    assert isinstance(accounts, list)

    db.close()


if __name__ == "__main__":
    test_admin_get_all_accounts()
