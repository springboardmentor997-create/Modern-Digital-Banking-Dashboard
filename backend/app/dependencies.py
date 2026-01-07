"""
Shared Dependencies

What:
- Extracts logged-in user from JWT
- Protects secure endpoints

Backend Connections:
- Used inside routers:
  - accounts.py
  - transactions.py

Frontend Connections:
- ProtectedRoute.jsx
- Any dashboard page after login

Flow:
Frontend sends token → dependency validates → router executes
"""





from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.database import Base, SessionLocal  # ensure your database.py exports engine & Base
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.jwt import decode_access_token
from app.models.user import User

# if you already have create_engine in database.py, reuse it instead
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
        token: str = Depends(oauth2_scheme), 
        db: Session = Depends(get_db)
    ) -> User:
        try:
            payload = decode_access_token(token)

            if payload.get("type") != "access":
                raise HTTPException(
                     status_code=status.HTTP_401_UNAUTHORIZED,
                     detail="Invalid token type"
                     )

            user_id = int(payload.get("sub"))
               
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="User not found"
            )
        return user



def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
