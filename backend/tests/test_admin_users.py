from app.admin.service import get_all_users
from app.database import SessionLocal


def test_admin_get_all_users():
    db = SessionLocal()

    users = get_all_users(db)

    print("Total users:", len(users))
    assert isinstance(users, list)

    db.close()


if __name__ == "__main__":
    test_admin_get_all_users()
