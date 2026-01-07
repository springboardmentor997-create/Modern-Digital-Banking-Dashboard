# backend/app/services/admin_service.py

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.user import User


def get_all_users(
    db: Session,
    search: str | None = None,
    kyc_status: str | None = None,
):
    query = db.query(User).filter(User.is_admin == False)

    # 🔍 search by name or email
    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    # 🛡️ filter by kyc status
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status)

    return query.order_by(User.created_at.desc()).all()

def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user




def update_user_kyc(
    db: Session,
    user_id: int,
    status: str,
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.kyc_status = status
    db.commit()
    db.refresh(user)

    return user
