from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from app.models.user import User
from sqlalchemy.exc import IntegrityError
import secrets
from sqlalchemy.orm import Session
from app.utils.hashing import Hash
from app.utils.validators import is_strong_password
from app.models.otp import OTP
import random
from app.utils.email_utils import send_email
from app.models.user_settings import UserSettings
from app.alerts.service import create_alert
from app.models.user_device import UserDevice
from app.firebase.firebase import send_push_notification
from datetime import datetime, timedelta, timezone




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


def reset_password(db: Session, email: str, new_password: str) -> bool:
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return False

    # ❌ New password must not be same as old password
    if Hash.verify(user.password, new_password):
        raise ValueError("New password cannot be the same as old password")

    # ❌ Password strength validation
    if not is_strong_password(new_password):
        raise ValueError(
            "Password must be at least 8 characters long and include "
            "uppercase, lowercase, number, and special character"
        )

    # ✅ Update password
    user.password = Hash.bcrypt(new_password)
    db.commit()
    return True




def send_otp(db: Session, identifier: str):
    otp_code = str(random.randint(100000, 999999))

    otp = OTP(
        identifier=identifier,
        otp=otp_code,
        expires_at=OTP.expiry()
    )

    db.add(otp)
    db.commit()

    # ✅ EMAIL OTP (FREE)
    if "@" in identifier:
        send_email(
            to_email=identifier,
            subject="Your OTP Code",
            body=f"Your OTP is {otp_code}. It is valid for 2 minutes."
        )


    
def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_email(db, identifier)

    if not user or not Hash.verify(user.password, password):
        return None

    # ✅ Load settings
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == user.id)
        .first()
    )

    # 🔔 LOGIN ALERT
    if settings and settings.login_alerts:
        create_alert(
            db=db,
            user_id=user.id,
            alert_type="login",
            message="New device login detected"
        )


        if settings.email_alerts:
            send_email(
                to_email=user.email,
                subject="New Login Alert",
                body="A new device login to your account was detected."
            )

        devices = db.query(UserDevice).filter(
            UserDevice.user_id == user.id
        ).all()

        for device in devices:
            try:
                send_push_notification(
                    token=device.device_token,
                    title="New Login Alert",
                    body="A new device login to your account was detected."
                )
            except Exception as e:
                print("Push notification failed:", e)

    # 🔐 TWO-FACTOR AUTH
    if settings and settings.two_factor_enabled:
        send_otp(db, user.email)
        return {
            "otp_required": True,
            "user_id": user.id
        }
    

    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # ✅ Normal login success
    return user
