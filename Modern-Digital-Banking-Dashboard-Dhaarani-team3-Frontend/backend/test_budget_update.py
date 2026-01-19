from decimal import Decimal
from datetime import datetime

from app.database import SessionLocal
# import all model modules to ensure SQLAlchemy mappers are configured
import app.models.account
import app.models.bill
import app.models.transaction
import app.models.budget
import app.models.user

from app.models.account import Account
from app.models.budget import Budget
from app.transactions.schemas import TransactionCreate
from app.transactions.service import TransactionService


def run_test(user_id=3, category='food', amount=1000, month=1, year=2026):
    db = SessionLocal()
    try:
        # find an account for the user
        acct = db.query(Account).filter(Account.user_id == user_id).first()
        if not acct:
            print(f"No account found for user_id={user_id}")
            return

        print(f"Using account id={acct.id} for user_id={user_id}")

        # show budget before
        bud = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
            Budget.category == category
        ).first()

        if bud:
            print(f"Before: budget id={bud.id} spent_amount={bud.spent_amount} limit_amount={bud.limit_amount}")
        else:
            print(f"No budget found for user={user_id} month={month} year={year} category={category}")

        txn_data = TransactionCreate(
            description="Test purchase",
            category=category,
            amount=Decimal(str(amount)),
            currency="INR",
            txn_type="debit",
            merchant="TestMerchant",
            txn_date=datetime(year, month, 15, 12, 0, 0)
        )

        txn = TransactionService.create_transaction(db, acct.id, txn_data)
        print(f"Created transaction id={getattr(txn,'id',None)} amount={txn.amount} category={txn.category} txn_type={txn.txn_type}")

        # re-query budget
        bud2 = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
            Budget.category == category
        ).first()

        if bud2:
            print(f"After: budget id={bud2.id} spent_amount={bud2.spent_amount} limit_amount={bud2.limit_amount}")
        else:
            print("No budget found after creating transaction.")

    except Exception as e:
        print("Error during test:", e)
    finally:
        db.close()


if __name__ == '__main__':
    run_test()
