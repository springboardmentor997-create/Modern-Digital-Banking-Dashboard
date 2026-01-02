from app.admin.service import get_all_transactions
from app.database import SessionLocal


def test_admin_get_all_transactions():
    db = SessionLocal()

    transactions = get_all_transactions(db)

    print("Total transactions:", len(transactions))
    assert isinstance(transactions, list)

    db.close()


if __name__ == "__main__":
    test_admin_get_all_transactions()
