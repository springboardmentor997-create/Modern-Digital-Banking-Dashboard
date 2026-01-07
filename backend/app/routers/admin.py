# backend/app/routers/admin.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.admin import AdminUserOut, AdminUserDetailOut
from app.services.admin_service import get_all_users, get_user_by_id
from app.dependencies import get_current_admin_user
from app.schemas.admin import AdminKycUpdate
from app.services.admin_service import update_user_kyc

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/users",
    response_model=List[AdminUserOut],
)
def list_users(
    search: str | None = Query(None),
    kyc_status: str | None = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return get_all_users(
        db=db,
        search=search,
        kyc_status=kyc_status,
    )


@router.get(
    "/users/{user_id}",
    response_model=AdminUserDetailOut,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return get_user_by_id(db, user_id)


from app.schemas.admin import AdminKycUpdate
from app.services.admin_service import update_user_kyc

@router.patch(
    "/users/{user_id}/kyc",
    response_model=AdminUserOut,
)
def update_kyc_status(
    user_id: int,
    data: AdminKycUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return update_user_kyc(
        db=db,
        user_id=user_id,
        status=data.status,
    )
