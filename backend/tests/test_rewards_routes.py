from app.database import SessionLocal
from app.rewards.service import get_user_rewards, get_total_reward_points


def test_rewards_routes_logic():
    db = SessionLocal()
    user_id = 2

    rewards = get_user_rewards(db, user_id)
    points = get_total_reward_points(db, user_id)

    print("Rewards count:", len(rewards))
    print("Total points:", points)

    assert isinstance(points, int)

    db.close()


if __name__ == "__main__":
    print("Testing rewards route logic...")
    test_rewards_routes_logic()
    print("Rewards routes logic test passed.")
