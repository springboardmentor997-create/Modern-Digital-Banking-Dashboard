from app.database import SessionLocal
from app.schemas.user_schema import UserCreate
from app.auth.service import create_user, authenticate_user

db = SessionLocal()

print("Creating user...")
user = create_user(
    db,
    UserCreate(
        name="Auth Test",
        email="auth@test.com",
        password="securepassword",
        phone="8888888888"
    )
)
print("User created:", user.email)

print("Authenticating user...")
auth_user = authenticate_user(db, "auth@test.com", "securepassword")
assert auth_user is not None
print("Authentication successful")

print("Authenticating with wrong password...")
auth_fail = authenticate_user(db, "auth@test.com", "wrongpass")
assert auth_fail is None
print("Wrong password rejected")

db.close()
print("Auth service tests passed.")
