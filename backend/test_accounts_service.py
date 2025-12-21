from app.database import SessionLocal
from app.accounts.schemas import AccountCreate
from app.accounts.service import create_account, get_user_accounts

db = SessionLocal()

user_id = 1  # use an existing user ID from users table

account = create_account(
    db,
    user_id,
    AccountCreate(
        bank_name="Test Bank",
        account_type="savings",
        masked_account="XXXX1234",
        currency="INR",
        balance=10000
    )
)

print("Account created:", account.id)

accounts = get_user_accounts(db, user_id)
print("Accounts for user:", len(accounts))

db.close()
