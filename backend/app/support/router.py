from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_support_or_admin
from app.admin.service import (
    get_all_users,
    get_all_accounts,
    get_all_transactions,
)
from app.alerts.service import get_all_alerts

router = APIRouter(
    prefix="/support",
    tags=["Support"],
)

@router.get("/users")
def support_view_users(
    db: Session = Depends(get_db),
    user=Depends(require_support_or_admin),
):
    return get_all_users(db)


@router.get("/accounts")
def support_view_accounts(
    db: Session = Depends(get_db),
    user=Depends(require_support_or_admin),
):
    return get_all_accounts(db)


@router.get("/transactions")
def support_view_transactions(
    db: Session = Depends(get_db),
    user=Depends(require_support_or_admin),
):
    return get_all_transactions(db)


@router.get("/alerts")
def support_view_alerts(
    db: Session = Depends(get_db),
    user=Depends(require_support_or_admin),
):
    return get_all_alerts(db)
