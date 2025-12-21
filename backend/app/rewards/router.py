from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker
from app.database import get_db
from app.rewards import service as rewards_service
from app.rewards.schemas import RewardCreate, RewardUpdate, RewardResponse
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[RewardResponse])
def list_rewards(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	return rewards_service.get_rewards_for_user(db, current_user.id)


@router.post("/", response_model=RewardResponse)
def create_reward(payload: RewardCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	return rewards_service.create_reward(db, current_user.id, payload)


@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(reward_id: int, payload: RewardUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	reward = rewards_service.get_reward(db, reward_id, current_user.id)
	if not reward:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	return rewards_service.update_reward(db, reward, payload)


@router.delete("/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin"]))):
	# Admins may delete any reward; owners are still allowed if you change policy.
	reward = rewards_service.get_reward_by_id(db, reward_id)
	if not reward:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	rewards_service.delete_reward(db, reward)
	return {"message": "Reward deleted"}

