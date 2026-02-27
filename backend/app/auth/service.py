from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.utils.hash_password import hash_password, verify_password
from app.auth.security import create_access_token
from datetime import timedelta

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account is deactivated")
        return user
    
    @staticmethod
    def create_user(db: Session, name: str, email: str, password: str) -> User:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user = User(
            name=name,
            email=email,
            password=hash_password(password),
            role=UserRole.user,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def generate_tokens(user: User):
        access_token = create_access_token(
            subject=user.id,
            role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            expires_delta=timedelta(hours=24)
        )
        return access_token