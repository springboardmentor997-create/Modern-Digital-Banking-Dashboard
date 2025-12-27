from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, RoleChecker, require_admin, require_user_or_admin
from app.database import get_db
from app.rewards import service as rewards_service
from app.rewards.schemas import RewardCreate, RewardUpdate, RewardResponse
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction

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
	# Allow admin to optionally specify a target user_id in the payload.
	target_user_id = reward_create.user_id if getattr(reward_create, "user_id", None) else current_user.id
	return rewards_service.create_reward(db, target_user_id, reward_create)


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



@router.get("/accounts/suggest/{user_id}")
def suggest_reward_accounts(
	user_id: int,
	current_user: User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	# Admin only
	if getattr(current_user, "role", None) != "admin":
		raise HTTPException(status_code=403, detail="Admin only")

	# Get all user accounts
	accounts = db.query(Account).filter(Account.user_id == user_id).all()
	if not accounts:
		raise HTTPException(status_code=404, detail="No accounts found")

	suggestions = []
	for acc in accounts:
		# Count transactions for activity score
		txn_count = db.query(Transaction).filter(Transaction.account_id == acc.id).count()
		try:
			total_balance = float(acc.balance)
		except Exception:
			total_balance = 0.0

		# Smart recommendation logic
		recommendation = "normal"
		if txn_count > 30:
			recommendation = "high_activity"
		elif total_balance > 500000:
			recommendation = "high_balance"
		elif txn_count == 0:
			recommendation = "new_account"

		suggestions.append({
			"account_id": acc.id,
			"bank_name": acc.bank_name,
			"account_type": acc.account_type,
			"balance": acc.balance,
			"currency": acc.currency,
			"txn_count": txn_count,
			"recommendation": recommendation,
			"reward_suggestion": "RECOMMENDED" if recommendation in ["high_activity", "high_balance"] else "OPTIONAL"
		})

	return {
		"user_id": user_id,
		"total_accounts": len(accounts),
		"suggested_accounts": suggestions,
		"best_options": [s for s in suggestions if s["reward_suggestion"] == "RECOMMENDED"]
	}

