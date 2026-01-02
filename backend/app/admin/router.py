from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies import require_admin

from app.admin.service import (
    get_all_users,
    get_all_accounts,
    get_all_transactions,
    get_system_summary,
    set_user_active_status,
    get_all_alerts,
)

from app.admin.schemas import (
    AdminUserOut,
    AdminUserStatusUpdate,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

# -------------------------
# USERS
# -------------------------

@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_users(db)


@router.patch("/users/{user_id}/status", response_model=AdminUserOut)
def update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return set_user_active_status(
        db=db,
        user_id=user_id,
        is_active=payload.is_active,
    )

# -------------------------
# ACCOUNTS (READ-ONLY)
# -------------------------

@router.get("/accounts")
def list_accounts(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_accounts(db)

# -------------------------
# TRANSACTIONS (READ-ONLY)
# -------------------------

@router.get("/transactions")
def list_transactions(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_transactions(db)

# -------------------------
# ALERTS & LOGS
# -------------------------

@router.get("/alerts")
def list_alerts(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_alerts(db)

# -------------------------
# SYSTEM SUMMARY
# -------------------------

@router.get("/summary")
def system_summary(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_system_summary(db)
