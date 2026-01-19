from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
import traceback
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string

# Internal Imports
from app.database import get_db
from app import models
from app.models.user import User
from app.utils.jwt_handler import verify_token, create_access_token, create_refresh_token
from app.utils.hash_password import verify_password, hash_password

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# =======================
# 🔐 OAuth2 Scheme
# =======================
# This defines where the frontend should send the username/password to get a token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# =======================
# 📝 Pydantic Models
# =======================

class UserLogin(BaseModel):
    email: str
    password: str
    role: str = "user"  # Optional role field

class UserRegister(BaseModel):
    email: str
    password: str
    name: str = None 

# Models for Password Reset
class ForgotPassword(BaseModel):
    email: str

class VerifyOTP(BaseModel):
    email: str
    otp: str

class ResetPassword(BaseModel):
    email: str
    new_password: str
    otp: str = None

# =======================
# 🛡️ GLOBAL AUTH DEPENDENCY
# =======================
# 🚨 CRITICAL: This is the function 'transactions.py' is trying to import!
# It verifies the token and returns the User object from the database.
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Verify token and extract User ID
    # Note: We pass the exception so verify_token can raise it if needed
    try:
        user_id = verify_token(token, credentials_exception)
    except Exception:
        raise credentials_exception

    # 2. Query Database for this User ID
    # Convert user_id to int just in case it came back as a string
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if user is None:
        raise credentials_exception
        
    return user

# =======================
# 🚀 Auth Routes
# =======================

@router.post("/signup")
def register(user: UserRegister, db: Session = Depends(get_db)):
    try:
        user_exist = db.query(models.User).filter(models.User.email == user.email).first()
        if user_exist:
            raise HTTPException(status_code=400, detail="User already exists")

        new_user = models.User(
            email=user.email,
            password=hash_password(user.password),
            name=user.name 
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        access_token = create_access_token(data={"user_id": str(new_user.id)})
        refresh_token = create_refresh_token(data={"user_id": str(new_user.id)})
        
        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer", 
            "user": {
                "id": new_user.id,
                "email": new_user.email, 
                "name": new_user.name,
                "role": new_user.role,
                "kyc_status": new_user.kyc_status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ SIGNUP ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Signup failed")

@router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        print(f"🔍 Login attempt for: {user_credentials.email}")
        
        # 1. Find user
        user = db.query(User).filter(User.email == user_credentials.email).first()
        print(f"👤 User found: {user is not None}")

        if not user:
            print("❌ User not found in database")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 2. Verify password
        print(f"🔐 Verifying password...")
        password_valid = verify_password(user_credentials.password, user.password)
        print(f"🔐 Password valid: {password_valid}")
        
        if not password_valid:
            print("❌ Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 3. Generate Tokens
        access_token = create_access_token(data={"user_id": str(user.id)})
        refresh_token = create_refresh_token(data={"user_id": str(user.id)})
        
        print(f"✅ Login successful for user: {user.email}")
        
        # 4. Return Response
        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer", 
            "user": {
                "id": user.id,
                "email": user.email, 
                "name": getattr(user, 'full_name', 'User') or getattr(user, 'name', 'User'),
                "role": user.role,
                "kyc_status": user.kyc_status
            }
        }

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"💥 Login error: {str(e)}")
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# 🔐 Password Reset Routes
# =======================

@router.post("/forgot-password")
def forgot_password(request: ForgotPassword, db: Session = Depends(get_db)):
    """Generates an OTP, sends it via email (reads sender creds from env), and stores a PasswordReset row.

    This endpoint is tolerant to clients that might send a nested payload like
    { "email": { "email": "user@example.com" } } due to frontend bugs.
    """
    # Accept nested shapes: normalize to a simple email string
    email_val = request.email
    if isinstance(email_val, dict):
        email_val = email_val.get('email')

    if not email_val or not isinstance(email_val, str):
        # Return generic success (avoid user enumeration) but also log the invalid payload
        print(f"⚠️ forgot-password received invalid payload: {request}")
        return {"message": "If the email exists, an OTP has been sent"}

    user = db.query(models.User).filter(models.User.email == email_val).first()
    # Always return success message to avoid leaking which emails are registered
    if not user:
        return {"message": "If the email exists, an OTP has been sent"}

    try:
        # Use centralized email service which returns the OTP (or a mocked OTP if creds missing)
        from app.utils.email_service import send_otp_email
        from app.auth.models import PasswordReset

        otp = send_otp_email(user.email)

        # Persist OTP so it can be validated server-side (extra safety vs in-memory)
        pr = PasswordReset(email=user.email, otp=str(otp))
        db.add(pr)
        db.commit()

        print(f"✅ Password reset OTP created and email queued for {user.email}")
        return {"message": "If the email exists, an OTP has been sent"}

    except Exception as e:
        print(f"❌ Forgot-password error: {e}")
        return {"message": "If the email exists, an OTP has been sent"}

@router.post("/verify-otp")
def verify_otp_endpoint(request: VerifyOTP, db: Session = Depends(get_db)):
    """Verify OTP using in-memory storage or persisted PasswordReset entries.

    Accepts either plain strings or nested payloads from misbehaving clients.
    """
    from app.utils.email_service import verify_otp_logic
    from app.auth.models import PasswordReset

    email_val = request.email
    otp_val = request.otp
    if isinstance(email_val, dict):
        email_val = email_val.get('email')
    if isinstance(otp_val, dict):
        otp_val = otp_val.get('otp')

    if not email_val or not otp_val:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # First try in-memory verification
    if verify_otp_logic(email_val, otp_val):
        return {"message": "OTP verified", "valid": True}

    # Fallback to DB check: find most recent unused OTP for this email
    pr = db.query(PasswordReset).filter(PasswordReset.email == email_val, PasswordReset.is_used == False).order_by(PasswordReset.created_at.desc()).first()
    if pr and pr.otp == otp_val:
        return {"message": "OTP verified", "valid": True}

    raise HTTPException(status_code=400, detail="Invalid OTP")

@router.post("/reset-password")
def reset_password(request: ResetPassword, db: Session = Depends(get_db)):
    """Reset password if OTP is valid. Marks the PasswordReset row as used."""
    # Log incoming payload for debugging malformed client requests
    try:
        print(f"🔁 Reset-password request payload: email={request.email}, otp={request.otp}, new_password={'***' if request.new_password else None}")
    except Exception:
        print(f"🔁 Reset-password request payload parsing failed: {request}")

    if not request.otp:
        raise HTTPException(status_code=400, detail="OTP is required to reset password")

    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from app.utils.email_service import verify_otp_logic
    from app.auth.models import PasswordReset
    from app.config import settings
    from datetime import datetime, timedelta
    import traceback

    try:
        # Verify OTP via in-memory store first
        valid = verify_otp_logic(request.email, request.otp)

        pr = None
        if not valid:
            pr = db.query(PasswordReset).filter(
                PasswordReset.email == request.email,
                PasswordReset.is_used == False
            ).order_by(PasswordReset.created_at.desc()).first()

            if not pr or pr.otp != request.otp:
                raise HTTPException(status_code=400, detail="Invalid or expired OTP")

            # Check expiry
            expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 15)
            pr_time = pr.created_at
            if pr_time is None:
                raise HTTPException(status_code=400, detail="Invalid or expired OTP")

            # Make timezone-naive comparison if necessary
            now = datetime.utcnow()
            if getattr(pr_time, 'tzinfo', None):
                pr_time = pr_time.replace(tzinfo=None)

            if pr_time < (now - timedelta(minutes=expiry_minutes)):
                raise HTTPException(status_code=400, detail="Invalid or expired OTP")

            # mark as used
            pr.is_used = True
            db.add(pr)

        # All good, set new password and commit
        user.password = hash_password(request.new_password)
        db.commit()

        return {"message": "Password reset successfully"}

    except HTTPException as http_ex:
        # Propagate expected HTTP errors
        raise http_ex
    except Exception as e:
        print(f"❌ Reset-password error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to reset password")

# =======================
# 👤 Profile Route
# =======================

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    We reuse the 'get_current_user' dependency defined above.
    """
    return {
        "id": current_user.id,
        "name": getattr(current_user, 'full_name', None) or getattr(current_user, 'name', None),
        "email": current_user.email,
        "kyc_status": getattr(current_user, 'kyc_status', 'unverified')
    }