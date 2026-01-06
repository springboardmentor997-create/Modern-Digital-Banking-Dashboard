from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.notifications import service as notifications_service
from app.notifications import crud as notifications_crud
from app.notifications.schemas import NotificationResponse, NotificationCreate
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        n = notifications_crud.create_notification(db, notification, current_user.id)
        return n
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return notifications_service.get_notifications_for_user(db, current_user.id)
