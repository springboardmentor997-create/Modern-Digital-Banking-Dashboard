from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.rewards.schemas import RewardBulkAssign, RewardResponse, RewardCreate, RewardUpdate
from app.models.reward import Reward
from app.models.user import User
from app.dependencies import require_admin, get_current_user
from app.rewards import service as rewards_service

router = APIRouter()


@router.post("/assign", response_model=List[RewardResponse])
def assign_rewards_bulk(payload: RewardBulkAssign, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
	"""Simple admin-only bulk assign: create one Reward per user_id.

	No validation, no try/catch, no account association.
	"""
	created: List[Reward] = []
	for uid in payload.user_ids:
		r = Reward(user_id=uid, program_name=payload.program_name, points_balance=payload.points_balance)
		db.add(r)
		db.commit()
		db.refresh(r)
		created.append(r)
	return created


@router.get("/", response_model=List[RewardResponse])
def list_rewards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	"""List rewards: admins see all, users see their own."""
	if getattr(current_user, "role", "user") == "admin":
		return rewards_service.get_all_rewards(db)
	return rewards_service.get_rewards_for_user(db, current_user.id)


@router.get("/{reward_id}", response_model=RewardResponse)
def get_reward(reward_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	r = rewards_service.get_reward_by_id(db, reward_id)
	if not r:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	if getattr(current_user, "role", "user") != "admin" and r.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
	return r


@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(reward_id: int, payload: RewardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	r = rewards_service.get_reward_by_id(db, reward_id)
	if not r:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	if getattr(current_user, "role", "user") != "admin" and r.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
	updated = rewards_service.update_reward(db, r, payload)
	return updated


@router.delete("/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	r = rewards_service.get_reward_by_id(db, reward_id)
	if not r:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
	if getattr(current_user, "role", "user") != "admin" and r.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
	rewards_service.delete_reward(db, r)
	return {"message": "Reward deleted"}


@router.post("/", response_model=RewardResponse)
def create_reward(payload: RewardCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
	"""Create a reward and optionally credit a specific account.

	Admins must provide `user_id` to assign the reward.
	If `account_id` is present on the payload the reward service will
	attempt to credit that account and create a transaction.
	"""
	if getattr(payload, "user_id", None) is None:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required when creating a reward")

	r = rewards_service.create_reward(db, payload.user_id, payload)
	return r
