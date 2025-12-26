# app/crud.py
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user):
    hashed = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
