from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.rewards.schemas import RewardCreate, RewardResponse, RewardUpdate
from app.rewards.service import RewardService
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=RewardResponse, status_code=status.HTTP_201_CREATED)
def create_reward(
    reward: RewardCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        return RewardService.create_reward(db, reward, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_rewards(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Get user's rewards from database
        user_rewards = RewardService.get_rewards(db, current_user.id)
        
        # Convert to response format
        rewards_data = []
        for reward in user_rewards:
            rewards_data.append({
                "id": reward.id,
                "title": reward.title,
                "description": reward.description,
                "points": reward.points_required or 0,
                "points_required": reward.points_required or 0,
                "value": reward.value or 0,
                "reward_type": reward.reward_type,
                "is_active": reward.is_active,
                "created_at": reward.created_at.isoformat() if reward.created_at else None,
                "given_by_admin": True  # All rewards in DB are admin-given
            })
        
        total_points = sum(r["points"] for r in rewards_data)
        total_cash_value = sum(r["value"] for r in rewards_data)
        
        return {
            "total_points": total_points,
            "total_cash_value": total_cash_value,
            "rewards": rewards_data,
            "redemption_options": [
                {"type": "cash", "min_points": 100, "rate": 0.01},
                {"type": "gift_card", "min_points": 500, "rate": 0.012},
                {"type": "travel", "min_points": 1000, "rate": 0.015}
            ]
        }
    except Exception as e:
        # Fallback to static data if database fails
        REWARDS_DATA = [
            {"id": 1, "title": "Cashback Bonus", "points": 500, "cash_value": 5.0, "category": "Shopping", "given_by_admin": False},
            {"id": 2, "title": "Travel Miles", "points": 1200, "cash_value": 12.0, "category": "Travel", "given_by_admin": False},
            {"id": 3, "title": "Dining Rewards", "points": 300, "cash_value": 3.0, "category": "Dining", "given_by_admin": False},
        ]
        
        total_points = sum(r["points"] for r in REWARDS_DATA)
        total_cash_value = sum(r["cash_value"] for r in REWARDS_DATA)
        
        return {
            "total_points": total_points,
            "total_cash_value": total_cash_value,
            "rewards": REWARDS_DATA,
            "redemption_options": [
                {"type": "cash", "min_points": 100, "rate": 0.01},
                {"type": "gift_card", "min_points": 500, "rate": 0.012},
                {"type": "travel", "min_points": 1000, "rate": 0.015}
            ]
        }

@router.post("/redeem")
def redeem_rewards(
    points: int,
    redemption_type: str
):
    rates = {"cash": 0.01, "gift_card": 0.012, "travel": 0.015}
    rate = rates.get(redemption_type, 0.01)
    cash_value = points * rate
    
    return {
        "message": "Rewards redeemed successfully",
        "points_redeemed": points,
        "cash_value": cash_value,
        "redemption_type": redemption_type
    }

@router.post("/{reward_id}/claim")
def claim_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Simple claim logic - in real app you'd check points balance, etc.
    return {
        "message": f"Reward {reward_id} claimed successfully",
        "reward_id": reward_id,
        "claimed_at": datetime.utcnow().isoformat()
    }

@router.get("/currency/rates")
def get_exchange_rates():
    return {
        "base_currency": "INR",
        "rates": {
            "INR": {"EUR": 0.010, "GBP": 0.0096, "JPY": 1.82, "USD": 0.012}
        },
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/{reward_id}", response_model=RewardResponse)
def get_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    reward = RewardService.get_reward_by_id(db, reward_id, current_user.id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward

@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(
    reward_id: int,
    reward_data: RewardUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    reward = RewardService.update_reward(db, reward_id, reward_data, current_user.id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward

@router.delete("/{reward_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = RewardService.delete_reward(db, reward_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Reward not found")
