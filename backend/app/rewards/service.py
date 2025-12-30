from sqlalchemy.orm import Session

from app.rewards.models import Reward
from app.rewards.schemas import RewardCreate


def create_reward(
    db: Session,
    reward_in: RewardCreate,
):
    reward = Reward(
        user_id=reward_in.user_id,
        title=reward_in.title,
        reason=reward_in.reason,
        points=reward_in.points,
    )

    db.add(reward)
    db.commit()
    db.refresh(reward)

    return reward


def get_user_rewards(
    db: Session,
    user_id: int,
):
    return (
        db.query(Reward)
        .filter(Reward.user_id == user_id)
        .order_by(Reward.created_at.desc())
        .all()
    )


def get_total_reward_points(
    db: Session,
    user_id: int,
) -> int:
    rewards = get_user_rewards(db, user_id)
    return sum(r.points for r in rewards)
