from app.database import SessionLocal
from app.rewards.schemas import RewardCreate
from app.rewards.service import (
    create_reward,
    get_user_rewards,
    get_total_reward_points,
)


def test_rewards_service():
    db = SessionLocal()
    user_id = 2

    print("Creating reward...")
    reward_in = RewardCreate(
        user_id=user_id,
        title="Test Reward",
        reason="Completed Week 6 reward module",
        points=25,
    )

    reward = create_reward(db, reward_in)
    print("Reward created:", reward.id)

    rewards = get_user_rewards(db, user_id)
    print("Total rewards:", len(rewards))

    total_points = get_total_reward_points(db, user_id)
    print("Total reward points:", total_points)

    assert total_points >= 25

    db.close()


if __name__ == "__main__":
    print("Running rewards service tests...")
    test_rewards_service()
    print("Rewards service tests passed.")
