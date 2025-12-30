from datetime import date
from decimal import Decimal

from app.bills.schemas import BillCreate, BillOut
from app.bills.models import BillFrequency


def test_bill_create_schema():
    bill = BillCreate(
        name="Internet Bill",
        amount=Decimal("999.99"),
        due_date=date.today(),
        frequency=BillFrequency.monthly,
    )

    print("BillCreate validated:", bill)


def test_bill_out_schema():
    bill_out = BillOut(
        id=1,
        name="Electricity",
        amount=Decimal("1200.00"),
        due_date=date.today(),
        frequency=BillFrequency.monthly,
        is_paid=False,
    )

    print("BillOut validated:", bill_out)


if __name__ == "__main__":
    test_bill_create_schema()
    test_bill_out_schema()
    print("Bills schema tests passed.")
