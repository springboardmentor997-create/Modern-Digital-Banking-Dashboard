from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User


def validate_user_ids(db: Session, user_ids: Iterable[int]) -> bool:
    """Ensure all provided user IDs exist in the database.

    Raises HTTPException(status 422) if any ids are missing.
    Returns True on success.
    """
    if not user_ids:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="user_ids must contain at least one id")

    # Query existing ids
    rows = db.query(User.id).filter(User.id.in_(list(user_ids))).all()
    existing = {r[0] for r in rows}

    missing = [uid for uid in user_ids if uid not in existing]
    if missing:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail={"missing_user_ids": missing})

    return True
