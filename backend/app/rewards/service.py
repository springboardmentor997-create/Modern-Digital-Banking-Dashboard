from sqlalchemy.orm import Session
from app.models.reward import Reward
from app.rewards.schemas import RewardCreate, RewardUpdate


class RewardService:
    @staticmethod
    def create_reward(db: Session, user_id: int, payload: RewardCreate):
        r = Reward(
            user_id=user_id,
            program_name=payload.program_name,
            points_balance=payload.points_balance,
        )
        db.add(r)
        db.commit()
        db.refresh(r)
        return r

    @staticmethod
    def get_rewards_for_user(db: Session, user_id: int):
        return db.query(Reward).filter(Reward.user_id == user_id).all()

    @staticmethod
    def get_all_rewards(db: Session):
        return db.query(Reward).order_by(Reward.id.desc()).all()

    @staticmethod
    def get_reward(db: Session, reward_id: int, user_id: int):
        return db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == user_id).first()

    @staticmethod
    def get_reward_by_id(db: Session, reward_id: int):
        return db.query(Reward).filter(Reward.id == reward_id).first()

    @staticmethod
    def update_reward(db: Session, reward: Reward, payload: RewardUpdate):
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(reward, k, v)
        db.add(reward)
        db.commit()
        db.refresh(reward)
        return reward

    @staticmethod
    def delete_reward(db: Session, reward: Reward):
        db.delete(reward)
        db.commit()


def create_reward(db: Session, user_id: int, payload: RewardCreate):
    return RewardService.create_reward(db, user_id, payload)

def get_rewards_for_user(db: Session, user_id: int):
    return RewardService.get_rewards_for_user(db, user_id)

def get_reward(db: Session, reward_id: int, user_id: int):
    return RewardService.get_reward(db, reward_id, user_id)

def get_reward_by_id(db: Session, reward_id: int):
    return RewardService.get_reward_by_id(db, reward_id)

def update_reward(db: Session, reward: Reward, payload: RewardUpdate):
    return RewardService.update_reward(db, reward, payload)

def delete_reward(db: Session, reward: Reward):
    return RewardService.delete_reward(db, reward)
