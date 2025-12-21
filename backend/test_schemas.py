from datetime import datetime
from app.schemas.user_schema import UserCreate, UserOut

def test_user_create():
    user = UserCreate(
        name="Test User",
        email="test@example.com",
        password="strongpassword",
        phone="9999999999"
    )
    print("UserCreate schema validated successfully")
    print(user)


def test_user_out():
    user = UserOut(
        id=1,
        name="Test User",
        email="test@example.com",
        phone="9999999999",
        kyc_status="unverified",
        created_at=datetime.utcnow()
    )
    print("UserOut schema validated successfully")
    print(user)


if __name__ == "__main__":
    print("Running schema tests...\n")
    test_user_create()
    print()
    test_user_out()
    print("\nAll schema tests passed.")
