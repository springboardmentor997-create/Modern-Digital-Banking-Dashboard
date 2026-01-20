from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import traceback, logging

from app.database import get_db
from app.auth.schemas import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOtpSchema
)
from app.models.user import User
from app.models.otp import OTP
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import TokenResponse
from app.utils.hashing import Hash
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.auth.service import send_otp, authenticate_user


router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger("uvicorn.error")

# ---------------------------------------------------------------------
# COOKIE SETTINGS
# ---------------------------------------------------------------------
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PARAMS = {
    "httponly": True,
    "samesite": "lax",
    "secure": False,
}

# ---------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------
def _make_user_dict(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": getattr(user, "phone", None),
        "is_admin": user.is_admin
    }

# ---------------------------------------------------------------------
# REGISTER
# ---------------------------------------------------------------------
@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        new_user = User(
            name=user.name,
            email=user.email,
            password=Hash.bcrypt(user.password),
        )

        for attr in ("phone", "dob", "address", "pin_code", "kyc_status"):
            if hasattr(user, attr) and getattr(user, attr, None) is not None:
                setattr(new_user, attr, getattr(user, attr))

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email conflict")
    except Exception as exc:
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(exc))
    

# ---------------------------------------------------------------------
# LOGIN
# ---------------------------------------------------------------------
@router.post("/login")
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    result = authenticate_user(db, form_data.username, form_data.password)

    if not result or isinstance(result, dict):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(subject=result.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _make_user_dict(result)
    }


# ---------------------------------------------------------------------
# LOGIN (COOKIE)
# ---------------------------------------------------------------------
@router.post("/login/cookie")
def login_cookie(payload: dict, db: Session = Depends(get_db)):
    identifier = payload.get("identifier")
    password = payload.get("password")

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")
    
    result = authenticate_user(db, identifier, password)

    if result is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    
    if isinstance(result, dict) and result.get("otp_required"):
        return {
            "otp_required": True, 
            "user_id": result["user_id"],
            "message": "OTP sent to registered email"
            }
    
    user =result

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    resp = JSONResponse(
        content={"access_token": access_token, "user": _make_user_dict(user)}
    )
    resp.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        **REFRESH_COOKIE_PARAMS
    )
    return resp

# ---------------------------------------------------------------------
# FORGOT PASSWORD (EMAIL / PHONE)
# ---------------------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    send_otp(db, data.email)
    return {"message": "OTP sent"}


# ---------------------------------------------------------------------
# VERIFY OTP
# ---------------------------------------------------------------------
@router.post("/verify-otp")
def verify_otp(data: VerifyOtpSchema, db: Session = Depends(get_db)):
    otp = db.query(OTP).filter(
        OTP.identifier == (data.email),
        OTP.otp == data.otp
    ).first()

    if not otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(otp)
    db.commit()

    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    resp = JSONResponse(
        content={
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "is_admin": user.is_admin
            }
        }
    )

    resp.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return resp


# ---------------------------------------------------------------------
# RESEND LOGIN OTP (FOR 2-STEP LOGIN)
# ---------------------------------------------------------------------
@router.post("/resend-login-otp")
def resend_login_otp(
    data: ForgotPasswordRequest,  # reuse schema (email field)
    db: Session = Depends(get_db)
):
    send_otp(db, data.email)
    return {"message": "OTP resent"}

# ---------------------------------------------------------------------
# RESEND PIN CHANGE OTP
# ---------------------------------------------------------------------
@router.post("/resend-pin-otp")
def resend_pin_otp(
    data: ForgotPasswordRequest,  # contains email
    db: Session = Depends(get_db)
):
    send_otp(db, data.email)
    return {"message": "OTP resent for PIN change"}

