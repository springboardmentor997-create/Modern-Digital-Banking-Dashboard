from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.utils.hash_password import verify_password, hash_password
from app.auth.security import create_access_token
from datetime import timedelta, datetime

router = APIRouter(tags=["Auth"])

@router.get("/test")
def test_endpoint():
    """Test endpoint to verify auth router is working"""
    return {"status": "ok", "message": "Auth router is working!"}

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str



@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        print(f"Login attempt for email: {request.email}")
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            print(f"User not found: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"User found: {user.email}, active: {user.is_active}")
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account is deactivated")
        
        if not verify_password(request.password, user.password):
            print(f"Password verification failed for: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create JWT token
        user_role = user.role.value if hasattr(user.role, 'value') else str(user.role) if hasattr(user, 'role') else 'user'
        access_token = create_access_token(
            subject=user.id,
            role=user_role,
            expires_delta=timedelta(hours=24)
        )
        
        print(f"Login successful for: {user.email}, role: {user_role}")
        return {
            "access_token": access_token,
            "user": {
                "id": user.id, 
                "email": user.email, 
                "name": user.name or "User", 
                "role": user_role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter(User.email == request.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user = User(
            name=request.name,
            email=request.email,
            password=hash_password(request.password),
            role=UserRole.user,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        user_role = user.role.value if hasattr(user.role, 'value') else 'user'
        access_token = create_access_token(
            subject=user.id,
            role=user_role,
            expires_delta=timedelta(hours=24)
        )
        
        return {
            "access_token": access_token,
            "user": {
                "id": user.id, 
                "email": user.email, 
                "name": user.name, 
                "role": user_role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/register")
def register(request: SignupRequest, db: Session = Depends(get_db)):
    """Alias for signup endpoint"""
    return signup(request, db)

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send OTP for password reset"""
    user = db.query(User).filter(User.email == request.email).first()
    
    # Always return success to avoid email enumeration
    if not user:
        return {"message": "If the email exists, an OTP has been sent"}
    
    try:
        from app.utils.email_service import send_otp_email
        from app.auth.models import PasswordReset
        
        # Generate and send OTP
        otp = send_otp_email(user.email)
        
        # Store OTP in database for verification
        pr = PasswordReset(email=user.email, otp=str(otp))
        db.add(pr)
        db.commit()
        
        print(f"✅ Password reset OTP sent to {user.email}: {otp}")
        return {"message": "If the email exists, an OTP has been sent"}
    except Exception as e:
        print(f"❌ Error sending OTP: {e}")
        db.rollback()
        return {"message": "If the email exists, an OTP has been sent"}

@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP code"""
    from app.utils.email_service import verify_otp_logic
    from app.auth.models import PasswordReset
    from app.config import settings
    
    # First try in-memory verification
    if verify_otp_logic(request.email, request.otp):
        return {"message": "OTP verified", "valid": True}
    
    # Fallback to database check
    try:
        pr = db.query(PasswordReset).filter(
            PasswordReset.email == request.email,
            PasswordReset.is_used == False
        ).order_by(PasswordReset.created_at.desc()).first()
        
        if pr and pr.otp == request.otp:
            expiry_minutes = getattr(settings, "OTP_EXPIRY_MINUTES", 15)
            if (datetime.utcnow() - pr.created_at).total_seconds() > expiry_minutes * 60:
                raise HTTPException(status_code=400, detail="OTP expired")
            return {"message": "OTP verified", "valid": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️ OTP verification error: {e}")
    
    raise HTTPException(status_code=400, detail="Invalid OTP")

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password with OTP"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from app.utils.email_service import verify_otp_logic
    from app.auth.models import PasswordReset
    from app.config import settings
    
    # Verify OTP via in-memory store first
    if verify_otp_logic(request.email, request.otp):
        user.password = hash_password(request.new_password)
        db.commit()
        print(f"✅ Password reset successful for {user.email}")
        return {"message": "Password reset successfully"}
    
    # Fallback to database check
    try:
        pr = db.query(PasswordReset).filter(
            PasswordReset.email == request.email,
            PasswordReset.is_used == False
        ).order_by(PasswordReset.created_at.desc()).first()
        
        if not pr or pr.otp != request.otp:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        expiry_minutes = getattr(settings, "OTP_EXPIRY_MINUTES", 15)
        if (datetime.utcnow() - pr.created_at).total_seconds() > expiry_minutes * 60:
            raise HTTPException(status_code=400, detail="OTP expired")
        
        # Mark OTP as used
        pr.is_used = True
        db.add(pr)
        
        # Reset password
        user.password = hash_password(request.new_password)
        db.commit()
        
        print(f"✅ Password reset successful for {user.email}")
        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset password")

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest, 
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password for logged-in user with old password verification"""
    try:
        # Validate passwords match
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")
        
        # Verify old password
        if not verify_password(request.old_password, current_user.password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Check new password is different from old
        if request.old_password == request.new_password:
            raise HTTPException(status_code=400, detail="New password must be different from current password")
        
        # Update password
        current_user.password = hash_password(request.new_password)
        db.commit()
        
        print(f"✅ Password changed successfully for user {current_user.email}")
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password change error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to change password")