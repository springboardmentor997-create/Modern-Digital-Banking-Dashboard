from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.database import SessionLocal
from app.models.reward import Reward
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/rewards/recent")
async def get_recent_rewards():
    db = SessionLocal()
    try:
        recent_rewards = db.query(Reward, User).join(User).filter(
            Reward.given_by_admin == True
        ).order_by(Reward.created_at.desc()).limit(20).all()
        
        return JSONResponse(
            content=[{
                "id": reward.id,
                "title": getattr(reward, 'title', None) or reward.program_name,
                "points": reward.points_balance,
                "admin_message": getattr(reward, 'admin_message', None),
                "created_at": reward.created_at.isoformat(),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                }
            } for reward, user in recent_rewards],
            headers={"Access-Control-Allow-Origin": "*"}
        )
    finally:
        db.close()

@router.post("/users/{user_id}/give-reward")
async def give_reward_to_user(user_id: int, reward_data: dict):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(
                content={"error": "User not found"},
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        new_reward = Reward(
            user_id=user_id,
            program_name=reward_data.get('title', 'Admin Reward'),
            points_balance=reward_data.get('points', 0),
            given_by_admin=True,
            admin_message=reward_data.get('admin_message', f"Admin reward: {reward_data.get('points', 0)} points"),
            title=reward_data.get('title', 'Admin Reward')
        )
        
        db.add(new_reward)
        db.commit()
        
        return JSONResponse(
            content={"message": f"Successfully gave {reward_data.get('points', 0)} points to {user.name}"},
            headers={"Access-Control-Allow-Origin": "*"}
        )
    finally:
        db.close()