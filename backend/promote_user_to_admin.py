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


def promote(email: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User not found: {email}")
        return 1
    user.role = "admin"
    db.add(user)
    db.commit()
    print(f"Promoted {email} to admin")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_user_to_admin.py <email>")
        sys.exit(1)
    sys.exit(promote(sys.argv[1]))
