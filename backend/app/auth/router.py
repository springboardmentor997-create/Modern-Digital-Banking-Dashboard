import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.user_schema import LoginRequest, LoginResponse, SignupRequest, SignupResponse
from app.utils.jwt_handler import create_access_token, create_refresh_token
from app.utils.hash_password import verify_password, hash_password
from app.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Auth"])

@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email")
    
    hashed_password = hash_password(payload.password)
    
    new_user = User(
        name=payload.name,
        email=payload.email,
        password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"user_id": user.id})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    return {
        "message": "Login successful", 
        "access_token": access_token, 
        "refresh_token": refresh_token
    }
