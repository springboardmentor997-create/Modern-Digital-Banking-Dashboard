from sqlalchemy.orm import Session
from app.models.account import Account
from app.accounts.schemas import AccountCreate, AccountUpdate
from app.models.transaction import Transaction
from app.models.bill import Bill

class AccountService:
    @staticmethod
    def create_account(db: Session, user_id: int, account_data: AccountCreate):
        # normalize account_type values coming from frontend (e.g., 'Savings' -> 'savings')
        acct_type_raw = (account_data.account_type or "").strip()
        acct_type = acct_type_raw.lower().replace(" ", "_")
        # allowed enum values (safety): savings, checking, credit_card, loan, investment
        allowed = {"savings", "checking", "credit_card", "loan", "investment"}
        if acct_type not in allowed:
            # default to a safe enum value when frontend sends unexpected strings
            acct_type = "savings"

        new_account = Account(
            user_id=user_id,
            bank_name=account_data.bank_name,
            account_type=acct_type,
            masked_account=account_data.masked_account,
            currency=account_data.currency,
            balance=account_data.balance
        )
        
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        
        return new_account
    
    @staticmethod
    def get_user_accounts(db: Session, user_id: int):
        return db.query(Account).filter(Account.user_id == user_id).all()
    
    @staticmethod
    def get_all_accounts(db: Session):
        return db.query(Account).all()

    @staticmethod
    def get_account_by_id_any(db: Session, account_id: int):
        return db.query(Account).filter(
            Account.id == account_id
        ).first()
    
    @staticmethod
    def get_account_by_id(db: Session, account_id: int, user_id: int):
        return db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == user_id
        ).first()
    
    @staticmethod
    def update_account(db: Session, account: Account, account_data: AccountUpdate):
        data = account_data.dict(exclude_unset=True)
        # normalize account_type if provided
        if "account_type" in data:
            at_raw = (data.get("account_type") or "").strip()
            at = at_raw.lower().replace(" ", "_")
            if at not in {"savings", "checking", "credit_card", "loan", "investment"}:
                at = "savings"
            data["account_type"] = at

        for key, value in data.items():
            setattr(account, key, value)
        
        db.commit()
        db.refresh(account)
        
        return account
    
    @staticmethod
    def delete_account(db: Session, account: Account):
        # Delete related transactions and bills first to avoid FK constraint issues
        txns_deleted = db.query(Transaction).filter(Transaction.account_id == account.id).delete(synchronize_session=False)
        bills_deleted = 0
        # Some deployments / schemas may not have `Bill.account_id`; guard against AttributeError
        try:
            if hasattr(Bill, 'account_id'):
                bills_deleted = db.query(Bill).filter(Bill.account_id == account.id).delete(synchronize_session=False)
        except Exception as e:
            # Log and continue — don't fail deletion because bills table differs
            print(f"Warning: could not delete related bills for account {account.id}: {e}")

        db.delete(account)
        db.commit()

        return {
            "txns_deleted": int(txns_deleted or 0),
            "bills_deleted": int(bills_deleted or 0)
        }
