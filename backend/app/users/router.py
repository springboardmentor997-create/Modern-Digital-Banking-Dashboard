from fastapi import APIRouter, Depends, HTTPException, status
import re
from sqlalchemy.orm import Session
from typing import List, Dict
from app.dependencies import get_current_user, RoleChecker, require_admin, require_auditor_or_admin
from app.models.user import User
from app.database import get_db
from app.auth.schemas import UserResponse
from app.users.schemas import UpdateProfile, UserSettings, ChangePasswordRequest
from app.users.service import UserService
from fastapi import Body

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Return user profile augmented with their accounts
    return UserService.get_profile(db, current_user)


@router.get("/", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_auditor_or_admin)):
    # Admin/auditor endpoint to list all users (read-only for auditors)
    # Return only non-sensitive user fields plus a limited `accounts` list per user.
    users = db.query(type(current_user)).all()

    # Attach limited account summaries to each user object
    for u in users:
        acct_list = UserService.get_account_summaries(db, u.id)
        setattr(u, "accounts", acct_list)

    return users



@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admins can fetch any user; normal users can fetch only their own record.
    if getattr(current_user, "role", None) != "admin" and current_user.id != user_id:
        # Not permitted
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Fetch target user
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Attach limited account summaries (only id, bank_name, account_type, balance, currency)
    acct_list = UserService.get_account_summaries(db, target.id)
    setattr(target, "accounts", acct_list)
    return target


@router.put("/profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile = Body({}), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
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


@router.post("/profile/verify-kyc", response_model=UserResponse)
async def verify_kyc(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # This endpoint sets the current user's KYC status to 'verified'.
    # It's intended to be called when the user checks the KYC checkbox on registration/profile.
    updated = UserService.verify_kyc(db, current_user)
    return updated


@router.delete("/profile")
async def delete_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Delete the current user's account.

    This removes the user record from the database and any per-user settings stored on disk.
    Caller must be authenticated as the target user.
    """
    user_id = current_user.id

    # Cascade delete in safe order to avoid foreign key violations
    from app.models.reward import Reward
    from app.models.bill import Bill
    from app.models.transaction import Transaction
    from app.models.account import Account
    import os

    # 1) Delete rewards
    db.query(Reward).filter(Reward.user_id == user_id).delete(synchronize_session=False)

    # 2) Delete bills
    db.query(Bill).filter(Bill.user_id == user_id).delete(synchronize_session=False)

    # 3) Delete transactions for any accounts owned by the user
    db.query(Transaction).filter(Transaction.account_id.in_(
        db.query(Account.id).filter(Account.user_id == user_id)
    )).delete(synchronize_session=False)

    # 4) Delete accounts
    db.query(Account).filter(Account.user_id == user_id).delete(synchronize_session=False)

    # 5) Remove per-user settings file if present
    settings_path = f"backend/user_settings_{user_id}.json"
    if os.path.exists(settings_path):
        try:
            os.remove(settings_path)
        except Exception:
            pass

    # 6) Delete user record
    from app.models.user import User
    db.query(User).filter(User.id == user_id).delete(synchronize_session=False)

    db.commit()
    return {"message": f"User {user_id} and all data deleted"}
