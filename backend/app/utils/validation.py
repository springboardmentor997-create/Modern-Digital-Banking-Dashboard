from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
from app.models.user import User


def validate_user_ids(db: Session, user_ids: List[int]) -> List[int]:
    """Return list of valid user ids or raise HTTPException(422) with details.

    Raises HTTPException with a list of invalid ids if any are missing.
    """
    if not user_ids:
        raise HTTPException(status_code=422, detail="user_ids must not be empty")

    # Use ORM query to avoid textual SQL coercion issues across SQLAlchemy versions
    rows = db.query(User.id).filter(User.id.in_(user_ids)).all()
    found = {r[0] for r in rows}
    invalid = [uid for uid in user_ids if uid not in found]
    if invalid:
        raise HTTPException(status_code=422, detail={"errors": [{"user_ids": invalid, "error": "Some user_ids not found"}]})
    return user_ids


def validate_account_id(db: Session, account_id: int) -> int:
    """Return account_id if exists, else raise HTTPException(422)."""
    if account_id is None:
        return None
    row = db.execute("SELECT id FROM accounts WHERE id = :id", {"id": account_id}).fetchone()
    if not row:
        raise HTTPException(status_code=422, detail={"errors": [{"account_id": account_id, "error": "Account not found"}]})
    return account_id
