from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.auth.service import AuthService

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user, error = AuthService.register_user(db, user_data)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    access_token, refresh_token = AuthService.create_tokens(user.id)
    
    return {
        "user": UserResponse.from_orm(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user, error = AuthService.login_user(db, login_data)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )
    
    access_token, refresh_token = AuthService.create_tokens(user.id)
    
    return {
        "user": UserResponse.from_orm(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
