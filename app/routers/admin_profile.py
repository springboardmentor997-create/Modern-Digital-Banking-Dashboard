from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.admin_profile import (
    AdminProfileOut,
    AdminProfileUpdate,
    AdminChangePassword,
)
from app.dependencies import get_current_admin_user
from app.models.user import User
from app.utils.hashing import Hash

router = APIRouter(prefix="/admin", tags=["Admin Settings"])


@router.get("/profile", response_model=AdminProfileOut)
def get_admin_profile(
    current_admin: User = Depends(get_current_admin_user)
):
    return current_admin


@router.put("/profile")
def update_admin_profile(
    data: AdminProfileUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    current_admin.name = data.name
    current_admin.phone = data.phone

    db.commit()

    return {"message": "Admin profile updated"}


@router.put("/change-password")
def change_admin_password(
    data: AdminChangePassword,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    if not Hash.verify(current_admin.password, data.current_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_admin.password = Hash.bcrypt(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}
