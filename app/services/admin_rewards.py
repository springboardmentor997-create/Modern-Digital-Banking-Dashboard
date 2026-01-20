from sqlalchemy.orm import Session
from app.models.admin_rewards import AdminReward, RewardStatus


def create_admin_reward(db: Session, data):
    reward = AdminReward(
        name=data.name,
        description=data.description,
        reward_type=data.reward_type,
        applies_to=",".join(data.applies_to),
        value=data.value,
    )

    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


def get_all_admin_rewards(db: Session):
    return (
        db.query(AdminReward)
        .order_by(AdminReward.created_at.desc())
        .all()
    )


def approve_admin_reward(db: Session, reward_id: int):
    reward = db.query(AdminReward).filter(
        AdminReward.id == reward_id
    ).first()

    if not reward:
        return None

    reward.status = RewardStatus.active
    db.commit()
    db.refresh(reward)
    return reward


def delete_admin_reward(db: Session, reward_id: int):
    reward = db.query(AdminReward).filter(
        AdminReward.id == reward_id
    ).first()

    if not reward:
        return False

    db.delete(reward)
    db.commit()
    return True


def get_active_admin_rewards(db: Session):
    return (
        db.query(AdminReward)
        .filter(AdminReward.status == RewardStatus.active)
        .all()
    )
