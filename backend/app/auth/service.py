from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.utils.password_hash import hash_password, verify_password


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate):
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    hashed_password = hash_password(user_in.password)

    user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        phone=user_in.phone
        # kyc_status is NOT passed → DB default (unverified)
        # created_at is NOT passed → DB handles it
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user
