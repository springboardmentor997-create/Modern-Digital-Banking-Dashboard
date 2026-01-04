from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin

router = APIRouter()


@router.get("/valid_ids")
def get_valid_ids(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Return some existing user and account ids for testing bulk APIs (admin only)."""
    users = [r[0] for r in db.execute("SELECT id FROM users ORDER BY id LIMIT 50").fetchall()]
    accounts = [r[0] for r in db.execute("SELECT id FROM accounts ORDER BY id LIMIT 50").fetchall()]
    return {"users": users, "accounts": accounts}
