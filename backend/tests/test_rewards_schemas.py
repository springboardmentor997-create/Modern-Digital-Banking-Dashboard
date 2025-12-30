from datetime import datetime

from app.rewards.schemas import RewardCreate, RewardOut


def test_reward_create_schema():
    reward = RewardCreate(
        user_id=2,
        title="On-time Bill Payment",
        reason="Paid electricity bill before due date",
        points=50,
    )

    assert reward.user_id == 2
    assert reward.points == 50
    print("RewardCreate schema validated")


def test_reward_out_schema():
    reward = RewardOut(
        id=1,
        title="Monthly Saver",
        reason="Stayed under budget for the month",
        points=100,
        created_at=datetime.utcnow(),
    )

    assert reward.id == 1
    assert reward.points == 100
    print("RewardOut schema validated")


if __name__ == "__main__":
    print("Running rewards schema tests...")
    test_reward_create_schema()
    test_reward_out_schema()
    print("Rewards schema tests passed.")
