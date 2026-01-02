from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_roles
from app.admin.service import (
    get_all_users,
    get_all_accounts,
    get_all_transactions,
)
from app.admin.schemas import AdminUserOut

from app.admin.schemas import AdminUserStatusUpdate
from app.admin.service import set_user_active_status

from app.dependencies import get_db, require_admin

from app.admin.service import get_system_summary

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


@router.patch("/users/{user_id}/status", response_model=AdminUserOut)
def admin_update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    return set_user_active_status(
        db=db,
        user_id=user_id,
        is_active=payload.is_active,
    )


@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_users(db)


@router.get("/accounts")
def list_all_accounts(
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_accounts(db)


@router.get("/transactions")
def list_all_transactions(
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_transactions(db)


@router.get("/alerts")
def list_all_alerts(
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_alerts(db)


@router.get("/summary")
def system_summary(
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    return get_system_summary(db)
