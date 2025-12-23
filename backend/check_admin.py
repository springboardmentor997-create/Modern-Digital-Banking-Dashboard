"""
Simple script to check the role of `render.test@example.com` (or a provided email).
Usage:
    python check_admin.py [email]

Prints the user's role or a message if user not found.
"""
import sys
from app.database import SessionLocal
from app.models.user import User


def check(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User not found: {email}")
            return 2
        print(f"User: {email} — role: {getattr(user, 'role', 'user')}")
        return 0
    finally:
        db.close()


if __name__ == '__main__':
    email = sys.argv[1] if len(sys.argv) > 1 else 'render.test@example.com'
    sys.exit(check(email))
