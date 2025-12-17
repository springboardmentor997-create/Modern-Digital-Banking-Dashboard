from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from app.models.user import User
from sqlalchemy.exc import IntegrityError
import secrets
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "replace_this_with_env_secret"  # move to backend/app/config.py or env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded

def create_refresh_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded

# Basic DB helpers (synchronous for simplicity)
def create_user(db_session, *, name, email, password, phone=None, dob=None, pin=None, address=None, kyc_authorize=False):
    from app.models.user import User as UserModel
    user = UserModel(name=name, email=email, password=hash_password(password), phone=phone, dob=dob, pin_code=pin, address=address)
    try:
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    except IntegrityError:
        db_session.rollback()
        raise

def get_user_by_email(db_session, email: str):
    return db_session.query(User).filter(User.email == email).first()


# =========================
# FORGOT / RESET PASSWORD
# =========================

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def forgot_password(db: Session, email: str):
    """
    Generates reset token for user.
    Always returns success (even if user not found).
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return

    user.reset_token = secrets.token_urlsafe(32)
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)

    db.add(user)        # 🔑 REQUIRED
    db.commit()
    db.refresh(user)    # 🔑 REQUIRED


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """
    Resets password using valid reset token.
    """
    user = db.query(User).filter(User.reset_token == token).first()

    if not user:
        return False

    if not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return False

    user.password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()
    return True