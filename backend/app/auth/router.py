from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from app.auth.schemas import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.auth import service
from app.utils.password_hash import verify_password, get_password_hash
from app.utils.jwt_handler import create_access_token
from datetime import timedelta
from app.config import settings
from jose import jwt, JWTError
from app.dependencies import get_current_user_email

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await service.create_user(db=db, user=user)

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, email=login_data.email)
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(email: str = Depends(get_current_user_email), db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, email: str = Depends(get_current_user_email), db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return await service.update_user(db, user, user_update.name)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, email=request.email)
    if not user:
        # Do not reveal if user exists or not for security
        return {"message": "If the email exists, a reset link has been sent."}
    
    # Generate a reset token (valid for 15 mins)
    reset_token_expires = timedelta(minutes=15)
    reset_token = create_access_token(
        data={"sub": user.email, "type": "reset"}, expires_delta=reset_token_expires
    )
    
    # In a real app, send this token via email
    # For now, we will print it to the console so you can test it
    print(f"RESET LINK: http://localhost:5173/login?token={reset_token}")
    
    return {"message": "If the email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = await service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(request.new_password)
    user.password = hashed_password
    await db.commit()
    
    return {"message": "Password updated successfully"}
