from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.hashing import Hash


def get_admin_profile(db: Session, admin_id: int):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.is_admin == True
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return admin


def update_admin_profile(db: Session, admin_id: int, name: str, phone: str | None):
    admin = get_admin_profile(db, admin_id)

    admin.name = name
    admin.phone = phone

    db.commit()
    db.refresh(admin)

    return admin


def change_admin_password(
    db: Session,
    admin_id: int,
    current_password: str,
    new_password: str,
):
    admin = get_admin_profile(db, admin_id)

    # 🔐 Verify current password
    if not Hash.verify(current_password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # 🔐 Hash new password
    admin.password = Hash.hash(new_password)

    db.commit()

    return {"message": "Password updated successfully"}
