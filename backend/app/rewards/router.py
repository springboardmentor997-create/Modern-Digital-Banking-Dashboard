from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.rewards.schemas import RewardBulkAssign, RewardResponse
from app.models.reward import Reward
from app.models.user import User
from app.dependencies import require_admin

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
