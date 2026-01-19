from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
import traceback
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.rewards.schemas import RewardBulkAssign, RewardResponse, RewardCreate, RewardUpdate, RewardGroupUpdate
from app.models.reward import Reward
from app.models.user import User
from app.dependencies import require_admin, get_current_user, get_current_admin
from app.utils.validation import validate_user_ids
from app.rewards import service as rewards_service

router = APIRouter()


@router.post("/assign", response_model=List[RewardResponse])
def assign_rewards_bulk(payload: RewardBulkAssign, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
	"""Admin-only bulk assign: create one Reward per `user_id`.

	- Validate provided user IDs.
	- Add all Reward objects to the session.
	- Commit once, then refresh and return created rewards.
	"""
	# Wrap the whole handler so any unexpected error becomes JSONifiable and logged
	try:
		# validate user ids exist
		payload.check_ids_exist(db)

		# Delegate safe bulk work to service layer which handles per-user failures
		created = rewards_service.bulk_assign_rewards(db, payload)
		# Return created Reward objects (includes id and group_id)
		return created
	except Exception as exc:
		# Log traceback for debugging and return structured error JSON
		traceback_str = traceback.format_exc()
		print("Error in bulk assign:", str(exc))
		print(traceback_str)
		return JSONResponse(status_code=500, content={"error": str(exc), "trace": traceback_str})


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


@router.put("/{reward_id}", response_model=List[RewardResponse])
def update_reward(reward_id: int, payload: RewardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	r = rewards_service.get_reward_by_id(db, reward_id)
	if not r:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")

	# Only admins can update rewards that don't belong to them
	if getattr(current_user, "role", "user") != "admin" and r.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

	# Apply other updates (program_name, points_balance)
	for k, v in payload.dict(exclude_unset=True).items():
		if k in ("user_id", "user_ids"):
			continue
		setattr(r, k, v)

	db.add(r)
	db.commit()
	db.refresh(r)
	return [r]



@router.put("/group/{group_id}", response_model=List[RewardResponse])
def update_reward_group(group_id: int, payload: RewardGroupUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
	"""Update a reward group by `group_id` — replace or update assignments while preserving the master id.

	Behavior:
	- Validates provided `user_ids`.
	- Reuses the master reward (id == group_id) for the first user in the new list.
	- Reuses existing child rows where possible, creates new ones if needed, deletes extras.
	- Applies `program_name` and `points_balance` updates to all group members if provided.
	"""
	validate_user_ids(db, payload.user_ids)

	master = db.query(Reward).filter(Reward.id == group_id).first()
	if not master:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group master reward not found")

	# determine new values (fall back to master's existing values)
	new_program = payload.program_name if getattr(payload, "program_name", None) is not None else master.program_name
	new_points = payload.points_balance if getattr(payload, "points_balance", None) is not None else master.points_balance

	# gather existing group members (exclude master record itself)
	existing_children = db.query(Reward).filter(Reward.group_id == group_id, Reward.id != group_id).order_by(Reward.id).all()

	new_uids = payload.user_ids

	updated: List[Reward] = []

	# Update master to first new uid
	master.user_id = new_uids[0]
	master.program_name = new_program
	master.points_balance = int(new_points)
	master.group_id = group_id
	db.add(master)
	updated.append(master)

	# Reuse/update children rows where possible
	for idx, uid in enumerate(new_uids[1:]):
		if idx < len(existing_children):
			child = existing_children[idx]
			child.user_id = uid
			child.program_name = new_program
			child.points_balance = int(new_points)
			child.group_id = group_id
			db.add(child)
			updated.append(child)
		else:
			# create new child
			c = Reward(user_id=uid, program_name=new_program, points_balance=int(new_points), group_id=group_id)
			db.add(c)
			updated.append(c)

	# If there are extra existing children beyond the new list, delete them
	if len(existing_children) > max(0, len(new_uids) - 1):
		for extra in existing_children[len(new_uids) - 1:]:
			db.delete(extra)

	db.commit()

	# Refresh all updated/created rows
	for obj in updated:
		db.refresh(obj)

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
