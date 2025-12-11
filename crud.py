from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in):
    hashed = get_password_hash(user_in.password)
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        password=hashed,
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
