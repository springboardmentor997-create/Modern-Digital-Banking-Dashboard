from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_auditor_or_admin
from app.admin.service import (
    get_all_users,
    get_all_accounts,
    get_all_transactions,
    get_all_alerts,
)

router = APIRouter(
    prefix="/auditor",
    tags=["Auditor"],
)

@router.get("/users")
def auditor_users(
    db: Session = Depends(get_db),
    auditor=Depends(require_auditor_or_admin),
):
    return get_all_users(db)


@router.get("/accounts")
def auditor_accounts(
    db: Session = Depends(get_db),
    auditor=Depends(require_auditor_or_admin),
):
    return get_all_accounts(db)


@router.get("/transactions")
def auditor_transactions(
    db: Session = Depends(get_db),
    auditor=Depends(require_auditor_or_admin),
):
    return get_all_transactions(db)


@router.get("/alerts")
def auditor_alerts(
    db: Session = Depends(get_db),
    auditor=Depends(require_auditor_or_admin),
):
    return get_all_alerts(db)
