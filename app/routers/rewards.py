from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.reward import Reward
from pydantic import BaseModel

router = APIRouter()

class RedeemRequest(BaseModel):
    points: int
    redemption_type: str

class RewardCreateRequest(BaseModel):
    title: str
    description: str
    points: int

@router.get("")
def get_rewards(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        rewards = db.query(Reward).filter(Reward.user_id == current_user.id).all()
        
        # Return rewards directly as array
        return [
            {
                "id": reward.id,
                "title": getattr(reward, 'title', None) or reward.program_name,
                "points": reward.points_balance,
                "points_balance": reward.points_balance,
                "cash_value": reward.points_balance * 0.01,
                "category": "Admin Reward" if getattr(reward, 'given_by_admin', False) else "Banking",
                "is_claimed": False,
                "given_by_admin": getattr(reward, 'given_by_admin', False),
                "admin_message": getattr(reward, 'admin_message', None),
                "description": getattr(reward, 'admin_message', None) or reward.program_name,
                "created_at": getattr(reward, 'created_at', None) or reward.last_updated,
                "last_updated": reward.last_updated.isoformat() if reward.last_updated else None
            } for reward in rewards
        ]
    except Exception as e:
        print(f"Error in get_rewards: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/currency/rates")
def get_currency_rates():
    # Return mock currency rates - no authentication required for public data
    return {
        "INR": 1.0,
        "USD": 0.012,
        "EUR": 0.010,
        "GBP": 0.0096,
        "CAD": 0.016,
        "AUD": 0.018
    }

@router.post("/redeem")
def redeem_points(request: RedeemRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get user's total points
    rewards = db.query(Reward).filter(Reward.user_id == current_user.id).all()
    total_points = sum(reward.points_balance for reward in rewards)
    
    if total_points < request.points:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Calculate cash value based on redemption type
    multiplier = {
        "cash": 0.01,
        "gift_card": 0.012,
        "travel": 0.015
    }.get(request.redemption_type, 0.01)
    
    cash_value = request.points * multiplier
    
    # Deduct points from user's rewards (simple implementation)
    if rewards:
        rewards[0].points_balance -= request.points
        db.commit()
    
    return {
        "points_redeemed": request.points,
        "cash_value": cash_value,
        "redemption_type": request.redemption_type
    }

@router.post("")
def create_reward(request: RewardCreateRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    new_reward = Reward(
        user_id=current_user.id,
        program_name=request.title,
        points_balance=request.points
    )
    db.add(new_reward)
    db.commit()
    db.refresh(new_reward)
    
    return {
        "id": new_reward.id,
        "title": new_reward.program_name,
        "points": new_reward.points_balance,
        "message": "Reward created successfully"
    }

@router.get("/{reward_id}")
def get_reward(reward_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == current_user.id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    return {
        "id": reward.id,
        "title": reward.program_name,
        "points": reward.points_balance,
        "cash_value": reward.points_balance * 0.01,
        "category": "Banking",
        "is_claimed": False
    }

@router.put("/{reward_id}")
def update_reward(reward_id: int, request: RewardCreateRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == current_user.id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    reward.program_name = request.title
    reward.points_balance = request.points
    
    db.commit()
    db.refresh(reward)
    
    return {
        "id": reward.id,
        "title": reward.program_name,
        "points": reward.points_balance,
        "message": "Reward updated successfully"
    }

@router.delete("/{reward_id}")
def delete_reward(reward_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == current_user.id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    db.delete(reward)
    db.commit()
    
    return {"message": "Reward deleted successfully"}

@router.post("/{reward_id}/claim")
def claim_reward(reward_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == current_user.id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    # Mock implementation for claiming rewards
    return {
        "message": f"Reward {reward_id} claimed successfully",
        "reward_id": reward_id,
        "points_claimed": reward.points_balance
    }