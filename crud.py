from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in):
    user = models.User(
        name=user_in.name,
        phone=user_in.phone,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
