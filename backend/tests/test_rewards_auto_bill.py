from datetime import date, timedelta

from app.database import SessionLocal
from app.bills.schemas import BillCreate
from app.bills.service import create_bill, mark_bill_as_paid
from app.rewards.service import get_user_rewards


def test_auto_reward_on_bill_payment():
    db = SessionLocal()
    user_id = 2

    print("Creating bill...")
    bill_in = BillCreate(
        name="Test Auto Reward Bill",
        amount=500,
        due_date=date.today() + timedelta(days=2),
        frequency="monthly",
    )

    bill = create_bill(db, user_id, bill_in)

    print("Marking bill as paid...")
    mark_bill_as_paid(db, bill)

    rewards = get_user_rewards(db, user_id)
    matched = [r for r in rewards if r.title == "On-time Bill Payment"]

    print("Auto rewards found:", len(matched))
    assert len(matched) >= 1

    db.close()


if __name__ == "__main__":
    print("Running auto reward bill test...")
    test_auto_reward_on_bill_payment()
    print("Auto reward test passed.")
