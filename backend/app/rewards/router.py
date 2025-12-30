from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.rewards.service import (
    get_user_rewards,
    get_total_reward_points,
)
from app.rewards.schemas import RewardOut

router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"],
)


@router.get("/", response_model=list[RewardOut])
def list_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_rewards(db, current_user.id)


@router.get("/summary")
def rewards_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "total_points": get_total_reward_points(db, current_user.id)
    }
