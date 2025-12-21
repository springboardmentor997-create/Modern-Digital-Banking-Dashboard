from datetime import date
from app.database import SessionLocal
from app.transactions.schemas import TransactionCreate
from app.transactions.service import create_transaction
from app.transactions.models import TransactionType, TransactionCategory

db = SessionLocal()

USER_ID = 1       # must exist
ACCOUNT_ID = 1    # must belong to user

tx = create_transaction(
    db,
    USER_ID,
    TransactionCreate(
        account_id=ACCOUNT_ID,
        amount=500,
        transaction_type=TransactionType.expense,
        category=TransactionCategory.food,
        description="Lunch",
        transaction_date=date.today(),
    )
)

print("Transaction created:", tx.id)

db.close()
