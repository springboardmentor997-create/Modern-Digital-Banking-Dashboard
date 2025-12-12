from sqlalchemy.orm import Session
from app.models.account import Account
from app.accounts.schemas import AccountCreate, AccountUpdate

class AccountService:
    @staticmethod
    def create_account(db: Session, user_id: int, account_data: AccountCreate):
        new_account = Account(
            user_id=user_id,
            bank_name=account_data.bank_name,
            account_type=account_data.account_type,
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
    def get_account_by_id(db: Session, account_id: int, user_id: int):
        return db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == user_id
        ).first()
    
    @staticmethod
    def update_account(db: Session, account: Account, account_data: AccountUpdate):
        for key, value in account_data.dict(exclude_unset=True).items():
            setattr(account, key, value)
        
        db.commit()
        db.refresh(account)
        
        return account
    
    @staticmethod
    def delete_account(db: Session, account: Account):
        db.delete(account)
        db.commit()
