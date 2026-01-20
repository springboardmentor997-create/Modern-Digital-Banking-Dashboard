from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.admin_rewards import (
    AdminRewardCreate,
    AdminRewardResponse
)
from app.services.admin_rewards import (
    create_admin_reward,
    get_all_admin_rewards,
    approve_admin_reward,
    delete_admin_reward
)

router = APIRouter(
    prefix="/admin/rewards",
    tags=["Admin Rewards"]
)


# ===========================
# GET ALL REWARDS (ADMIN)
# ===========================
@router.get("/", response_model=list[AdminRewardResponse])
def list_admin_rewards(
    db: Session = Depends(get_db),
):
    rewards = get_all_admin_rewards(db)

    # Convert CSV -> list for frontend
    for r in rewards:
        r.applies_to = r.applies_to.split(",")

    return rewards


# ===========================
# CREATE NEW REWARD
# ===========================
@router.post("/", response_model=AdminRewardResponse)
def add_admin_reward(
    data: AdminRewardCreate,
    db: Session = Depends(get_db),
):
    reward = create_admin_reward(db, data)

    # Convert CSV -> list
    reward.applies_to = reward.applies_to.split(",")

    return reward


# ===========================
# APPROVE REWARD
# ===========================
@router.patch("/{reward_id}/approve")
def approve_reward(
    reward_id: int,
    db: Session = Depends(get_db),
):
    reward = approve_admin_reward(db, reward_id)

    if not reward:
        raise HTTPException(
            status_code=404,
            detail="Reward not found"
        )

    return {"message": "Reward approved successfully"}


# ===========================
# DELETE REWARD
# ===========================
@router.delete("/{reward_id}")
def remove_reward(
    reward_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_admin_reward(db, reward_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Reward not found"
        )

    return {"message": "Reward deleted successfully"}
