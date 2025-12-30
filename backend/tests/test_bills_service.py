from datetime import date, timedelta
from decimal import Decimal

from app.database import SessionLocal
from app.bills.schemas import BillCreate
from app.bills.service import (
    create_bill,
    get_user_bills,
    get_upcoming_bills,
    mark_bill_as_paid,
)


def test_bills_service():
    print("Running bills service tests...")

    db = SessionLocal()
    user_id = 2  # REMEMBERED. Calm down.

    # 1️⃣ Create bill
    bill_in = BillCreate(
        name="Test Internet",
        amount=Decimal("799.99"),
        due_date=date.today() + timedelta(days=5),
        frequency="monthly",
    )

    bill = create_bill(db, user_id, bill_in)
    print("Bill created:", bill.id)

    # 2️⃣ Fetch all bills
    bills = get_user_bills(db, user_id)
    print("Total bills for user:", len(bills))

    # 3️⃣ Fetch upcoming bills
    upcoming = get_upcoming_bills(db, user_id, date.today())
    print("Upcoming bills:", len(upcoming))

    # 4️⃣ Mark bill as paid
    paid_bill = mark_bill_as_paid(db, bill.id, user_id)
    print("Bill marked as paid:", paid_bill.is_paid)

    db.close()
    print("Bills service tests passed.")


if __name__ == "__main__":
    test_bills_service()
