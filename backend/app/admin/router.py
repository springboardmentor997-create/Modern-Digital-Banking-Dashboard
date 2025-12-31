from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_roles
from app.admin.service import (
    get_all_users,
    get_all_accounts,
    get_all_transactions,
)
from app.admin.schemas import AdminUserOut

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/users", response_model=list[AdminUserOut])
def admin_get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    return get_all_users(db)


@router.get("/accounts")
def admin_get_accounts(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    return get_all_accounts(db)


@router.get("/transactions")
def admin_get_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    return get_all_transactions(db)
