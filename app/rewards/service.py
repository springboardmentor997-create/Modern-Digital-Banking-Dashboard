from sqlalchemy.orm import Session
from app.models.reward import Reward


def get_user_rewards(db: Session, user_id: int):
    return (
        db.query(Reward)
        .filter(Reward.user_id == user_id)
        .all()
    )


def create_reward_program(
    db: Session,
    user_id: int,
    program_name: str
):
    reward = Reward(
        user_id=user_id,
        program_name=program_name,
        points_balance=0
    )

    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


def add_reward_points(
    db: Session,
    user_id: int,
    program_name: str,
    points: int
):
    reward = (
        db.query(Reward)
        .filter(
            Reward.user_id == user_id,
            Reward.program_name == program_name
        )
        .first()
    )

    if not reward:
        reward = Reward(
            user_id=user_id,
            program_name=program_name,
            points_balance=points
        )
        db.add(reward)
    else:
        reward.points_balance += points

    db.commit()
    db.refresh(reward)
    return reward
