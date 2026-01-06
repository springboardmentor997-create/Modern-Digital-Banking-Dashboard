from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.notifications import service as notifications_service
from app.notifications.schemas import NotificationResponse
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return notifications_service.get_notifications_for_user(db, current_user.id)
