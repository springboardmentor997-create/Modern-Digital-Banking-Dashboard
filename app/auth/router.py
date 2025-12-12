from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import traceback, logging

from app.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import TokenResponse
from app.utils.hashing import Hash
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger("uvicorn.error")

# ---------------------------------------------------------------------
# COOKIE SETTINGS
# ---------------------------------------------------------------------
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PARAMS = {
    "httponly": True,
    "samesite": "lax",   # 'none' + secure=True if your frontend is on different domain & you use HTTPS
    "secure": False,     # set True in production with HTTPS
}

# ---------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------
def _make_user_dict(user: User):
    return {"id": user.id, "name": user.name, "email": user.email, "phone": getattr(user, "phone", None)}

# ---------------------------------------------------------------------
# REGISTER (existing) - returns UserResponse
# ---------------------------------------------------------------------
@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        new_user = User(
            name=user.name,
            email=user.email,
            password=Hash.bcrypt(user.password)
        )

        for attr in ("phone", "dob", "address", "pin_code", "kyc_status"):
            if hasattr(user, attr) and getattr(user, attr, None) is not None and hasattr(new_user, attr):
                setattr(new_user, attr, getattr(user, attr))

        db.add(new_user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Email or data conflicts with existing user")
        db.refresh(new_user)
        return new_user

    except HTTPException:
        raise
    except Exception as exc:
        tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        logger.error("Registration error: %s\n%s", exc, tb)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(exc)}")

# ---------------------------------------------------------------------
# REGISTER + SET REFRESH COOKIE (preferred for browsers)
# ---------------------------------------------------------------------
@router.post("/register/cookie", status_code=201)
def register_user_cookie(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        new_user = User(
            name=user.name,
            email=user.email,
            password=Hash.bcrypt(user.password)
        )

        for attr in ("phone", "dob", "address", "pin_code", "kyc_status"):
            if hasattr(user, attr) and getattr(user, attr, None) is not None and hasattr(new_user, attr):
                setattr(new_user, attr, getattr(user, attr))

        db.add(new_user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Email or data conflicts with existing user")
        db.refresh(new_user)

        access_token = create_access_token(subject=new_user.id)
        refresh_token = create_refresh_token(subject=new_user.id)

        resp = JSONResponse(content={"access_token": access_token, "user": _make_user_dict(new_user)}, status_code=201)
        resp.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=REFRESH_COOKIE_PARAMS["httponly"],
            samesite=REFRESH_COOKIE_PARAMS["samesite"],
            secure=REFRESH_COOKIE_PARAMS["secure"],
        )
        return resp

    except HTTPException:
        raise
    except Exception as exc:
        tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        logger.error("Registration cookie error: %s\n%s", exc, tb)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(exc)}")

# ---------------------------------------------------------------------
# LOGIN (existing OAuth2) - returns tokens in body
# ---------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not Hash.verify(user.password, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

# ---------------------------------------------------------------------
# LOGIN + SET REFRESH COOKIE (axios-friendly JSON)
# ---------------------------------------------------------------------
@router.post("/login/cookie")
def login_cookie(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing email or password")

    user = db.query(User).filter(User.email == email).first()
    if not user or not Hash.verify(user.password, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    resp = JSONResponse(content={"access_token": access_token, "user": _make_user_dict(user)}, status_code=200)
    resp.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=REFRESH_COOKIE_PARAMS["httponly"],
        samesite=REFRESH_COOKIE_PARAMS["samesite"],
        secure=REFRESH_COOKIE_PARAMS["secure"],
    )
    return resp

# ---------------------------------------------------------------------
# REFRESH (existing) - body-based
# ---------------------------------------------------------------------
@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str):
    try:
        decoded = decode_refresh_token(refresh_token)
        user_id = decoded.get("sub")
        new_access = create_access_token(subject=user_id)
        new_refresh = create_refresh_token(subject=user_id)
        return TokenResponse(access_token=new_access, refresh_token=new_refresh)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

# ---------------------------------------------------------------------
# REFRESH FROM COOKIE (recommended) - reads HttpOnly cookie
# ---------------------------------------------------------------------
@router.post("/refresh/cookie")
def refresh_from_cookie(request: Request):
    try:
        refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            raise HTTPException(status_code=401, detail="Missing refresh cookie")

        decoded = decode_refresh_token(refresh_token)
        user_id = decoded.get("sub")

        new_access = create_access_token(subject=user_id)
        new_refresh = create_refresh_token(subject=user_id)

        resp = JSONResponse(content={"access_token": new_access, "user": {"id": int(user_id)}}, status_code=200)
        resp.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=new_refresh,
            httponly=REFRESH_COOKIE_PARAMS["httponly"],
            samesite=REFRESH_COOKIE_PARAMS["samesite"],
            secure=REFRESH_COOKIE_PARAMS["secure"],
        )
        return resp
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
