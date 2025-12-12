from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from app.models.user import User  # your SQLAlchemy user model
from app.database import SessionLocal
from sqlalchemy.exc import IntegrityError

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
