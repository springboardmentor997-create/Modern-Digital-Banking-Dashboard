from sqlalchemy.orm import Session
from app.models.reward import Reward
from app.rewards.schemas import RewardCreate, RewardUpdate
from typing import List, Optional

class RewardService:

    @staticmethod
    def create_reward(db: Session, reward_data: RewardCreate, user_id: int) -> Reward:
        db_reward = Reward(
            user_id=user_id,
            title=reward_data.title,
            description=reward_data.description,
            points_required=reward_data.points_required,
            reward_type=reward_data.reward_type,
            value=reward_data.value
        )
        db.add(db_reward)
        db.commit()
        db.refresh(db_reward)
        return db_reward

    @staticmethod
    def get_rewards(db: Session, user_id: int, active_only: bool = False) -> List[Reward]:
        query = db.query(Reward).filter(Reward.user_id == user_id)
        if active_only:
            query = query.filter(Reward.is_active == 1)
        return query.order_by(Reward.created_at.desc()).all()

    @staticmethod
    def get_reward_by_id(db: Session, reward_id: int, user_id: int) -> Optional[Reward]:
        return db.query(Reward).filter(
            Reward.id == reward_id,
            Reward.user_id == user_id
        ).first()

    @staticmethod
    def update_reward(db: Session, reward_id: int, reward_data: RewardUpdate, user_id: int) -> Optional[Reward]:
        reward = RewardService.get_reward_by_id(db, reward_id, user_id)
        if not reward:
            return None

        for field, value in reward_data.dict(exclude_unset=True).items():
            setattr(reward, field, value)

        db.commit()
        db.refresh(reward)
        return reward

    @staticmethod
    def delete_reward(db: Session, reward_id: int, user_id: int) -> bool:
        reward = RewardService.get_reward_by_id(db, reward_id, user_id)
        if not reward:
            return False

        db.delete(reward)
        db.commit()
        return True

    @staticmethod
    def redeem_reward(db: Session, reward_id: int, user_id: int) -> Optional[Reward]:
        reward = RewardService.get_reward_by_id(db, reward_id, user_id)
        if not reward or reward.is_active == 0:
            return None

        # Here you would typically check if user has enough points
        # For now, we'll just mark it as redeemed by setting is_active to 0
        reward.is_active = 0
        db.commit()
        db.refresh(reward)
        return reward

    @staticmethod
    def get_available_rewards(db: Session, user_id: int, user_points: int) -> List[Reward]:
        return db.query(Reward).filter(
            Reward.user_id == user_id,
            Reward.is_active == 1,
            Reward.points_required <= user_points
        ).order_by(Reward.points_required).all()
