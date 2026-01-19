"""
Simple script to promote a user to admin.
Usage (run from backend folder with the virtualenv active):

python promote_user_to_admin.py user@example.com

This will set the user's `role` to 'admin'. Intended for development / manual use only.
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.utils.password_hash import hash_password


def promote(email: str):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create a default admin user if not present (development convenience)
            print(f"User not found: {email} — creating new user with default password")
            default_password = "Admin@1234"
            user = User(
                name="Render Admin",
                email=email,
                phone="",
                password=hash_password(default_password),
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created and promoted {email} to admin (password: {default_password})")
            return 0

        if getattr(user, "role", None) != "admin":
            user.role = "admin"
            db.add(user)
            db.commit()
            print(f"Promoted {email} to admin")
        else:
            print(f"{email} is already an admin")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    # Default to a common test admin email when no argument provided.
    default_admin = "render.test@example.com"
    if len(sys.argv) < 2:
        print(f"No email provided — defaulting to {default_admin}")
        email = default_admin
    else:
        email = sys.argv[1]
    sys.exit(promote(email))
