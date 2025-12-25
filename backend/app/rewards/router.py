from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker, require_admin, require_user_or_admin
from app.database import get_db
from app.rewards import service as rewards_service
from app.rewards.schemas import RewardCreate, RewardUpdate, RewardResponse
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[RewardResponse])
async def list_rewards(
	current_user: User = Depends(require_user_or_admin),
	db: Session = Depends(get_db)
):
	# Admins can list all rewards; regular users can see only their own.
	user_role = getattr(current_user, "role", "user")
	if user_role == "admin":
		return rewards_service.get_all_rewards(db)
	return rewards_service.get_rewards_for_user(db, current_user.id)


@router.post("/", response_model=RewardResponse)
async def create_reward(
	reward_create: RewardCreate,
	current_user: User = Depends(require_admin),
	db: Session = Depends(get_db)
):
	return rewards_service.create_reward(db, current_user.id, reward_create)


@router.put("/{reward_id}", response_model=RewardResponse)
async def update_reward(
	reward_id: int,
	payload: RewardUpdate,
	current_user: User = Depends(require_admin),
	db: Session = Depends(get_db)
):
	# Admins can update any reward
	reward = rewards_service.get_reward_by_id(db, reward_id)
	if not reward:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	return rewards_service.update_reward(db, reward, payload)


@router.delete("/{reward_id}")
async def delete_reward(
	reward_id: int,
	current_user: User = Depends(require_admin),
	db: Session = Depends(get_db)
):
	# Admins may delete any reward
	reward = rewards_service.get_reward_by_id(db, reward_id)
	if not reward:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	rewards_service.delete_reward(db, reward)
	return {"message": "Reward deleted"}

