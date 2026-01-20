import os
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import *
from app.models.user import User
from app.utils.hashing import Hash


ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD")
ADMIN_NAME = os.getenv("SEED_ADMIN_NAME", "System Admin")
ADMIN_PHONE = os.getenv("SEED_ADMIN_PHONE")


def create_admin():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        print("❌ Admin seed env variables not set")
        return

    db: Session = SessionLocal()

    try:
        existing_admin = db.query(User).filter(
            User.email == ADMIN_EMAIL
        ).first()

        if existing_admin:
            print("✅ Admin user already exists")
            return

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password=Hash.bcrypt(ADMIN_PASSWORD),
            phone=ADMIN_PHONE,
            is_admin=True,
        )

        db.add(admin)
        db.commit()

        print("🚀 Admin user created successfully")

    finally:
        db.close()


# 🔥 THIS WAS MISSING
if __name__ == "__main__":
    create_admin()
