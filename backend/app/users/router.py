from fastapi import APIRouter, Depends, HTTPException, status
import re
from sqlalchemy.orm import Session
from typing import List, Dict
from app.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.database import get_db
from app.auth.schemas import UserResponse
from app.users.schemas import UpdateProfile, UserSettings, ChangePasswordRequest
from app.users.service import UserService

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user=Depends(get_current_user)):
    return UserService.get_profile(current_user)


@router.get("/", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin"]))):
    # Admin-only endpoint to list all users
    users = db.query(type(current_user)).all()
    return users


@router.put("/profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Normalize payload: exclude empty strings so they are not treated as provided
    raw = profile_data.dict()
    payload = {}
    for k, v in raw.items():
        if v is None:
            continue
        if isinstance(v, str) and v.strip() == "":
            continue
        payload[k] = v

    # Basic uniqueness and format check for email if provided
    if payload.get("email"):
        # basic email format check
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', payload.get("email")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")

        existing = db.query(type(current_user)).filter(type(current_user).email == payload.get("email"), type(current_user).id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    updated_user = UserService.update_profile(db, current_user, payload)
    return updated_user


@router.get("/settings", response_model=UserSettings)
async def get_settings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    settings = UserService.get_settings(current_user.id)
    # return defaults merged with stored
    defaults = UserSettings().dict()
    defaults.update(settings or {})
    return defaults


@router.put("/settings", response_model=UserSettings)
async def update_settings(settings: UserSettings, current_user=Depends(get_current_user)):
    saved = UserService.update_settings(current_user.id, settings.dict())
    return saved


@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    error = UserService.change_password(db, current_user, req.current_password, req.new_password)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return {"message": "Password changed successfully"}
