from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

# USER REWARDS (earned)
from app.rewards.schemas import RewardCreate, RewardResponse
from app.rewards.service import (
    get_user_rewards,
    create_reward_program
)

# ADMIN REWARDS (available offers)
from app.services.admin_rewards import get_active_admin_rewards
from app.schemas.admin_rewards import AdminRewardResponse


router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"]
)


# ============================
# USER EARNED REWARDS
# ============================
@router.get("/", response_model=list[RewardResponse])
def list_rewards(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_user_rewards(db, current_user.id)


@router.post("/", response_model=RewardResponse)
def create_reward(
    data: RewardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_reward_program(
        db,
        current_user.id,
        data.program_name
    )


# ============================
# AVAILABLE REWARDS (ADMIN → USER)
# ============================
@router.get("/available", response_model=list[AdminRewardResponse])
def list_available_rewards(
    db: Session = Depends(get_db),
):
    rewards = get_active_admin_rewards(db)

    # Convert CSV -> list for frontend
    for r in rewards:
        r.applies_to = r.applies_to.split(",")

    return rewards
