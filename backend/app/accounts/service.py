from sqlalchemy.orm import Session
from app.models.account import Account
from app.accounts.schemas import AccountCreate, AccountUpdate
from typing import List, Optional
from decimal import Decimal
import random


class AccountService:
    
    @staticmethod
    def _generate_account_number(db: Session) -> str:
        """Generate a unique 12-digit account number"""
        while True:
            # Generate account number: 4 digits + 4 digits + 4 digits
            account_number = ''.join([
                str(random.randint(0, 9)) for _ in range(12)
            ])
            # Check if masked_account already exists (since account_number field doesn't exist)
            existing = db.query(Account).filter(
                Account.masked_account == f"****{account_number[-4:]}"
            ).first()
            if not existing:
                return account_number
    
    @staticmethod
    def create_account(db: Session, account_data: AccountCreate, user_id: int) -> Account:
        # Generate random masked account number
        masked_account = f"****{random.randint(1000, 9999)}"
        
        db_account = Account(
            user_id=user_id,
            name=account_data.name,  # Use 'name' field directly
            account_type=account_data.account_type,
            masked_account=masked_account,
            balance=account_data.balance or 0.00,
            bank_name=account_data.bank_name or "Asunova Bank"
        )
        db.add(db_account)
        db.commit()
        db.refresh(db_account)

        # If the user does not have an active account, set this as active
        try:
            user = db.query(__import__('app').models.user.User).filter_by(id=user_id).first()
            if user and getattr(user, 'active_account_id', None) is None:
                user.active_account_id = db_account.id
                db.commit()
        except Exception:
            # don't break account creation on this auxiliary update
            try:
                db.rollback()
            except:
                pass

        return db_account
    
    @staticmethod
    def get_accounts(db: Session, user_id: int) -> List[Account]:
        return db.query(Account).filter(Account.user_id == user_id).all()
    
    @staticmethod
    def get_account_by_id(db: Session, account_id: int, user_id: int) -> Optional[Account]:
        return db.query(Account).filter(
            Account.id == account_id, 
            Account.user_id == user_id
        ).first()
    
    @staticmethod
    def update_account(
        db: Session, account_id: int, account_data: AccountUpdate, user_id: int
    ) -> Optional[Account]:
        account = AccountService.get_account_by_id(db, account_id, user_id)
        if not account:
            return None

        for field, value in account_data.dict(exclude_unset=True).items():
            setattr(account, field, value)

        db.commit()
        db.refresh(account)
        return account
    
    @staticmethod
    def delete_account(db: Session, account_id: int, user_id: int) -> bool:
        account = AccountService.get_account_by_id(db, account_id, user_id)
        if not account:
            return False
        
        db.delete(account)
        db.commit()
        return True
    
    @staticmethod
    def update_balance(db: Session, account_id: int, amount: Decimal) -> Optional[Account]:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return None
        
        account.balance += amount
        db.commit()
        db.refresh(account)
        return account
    
    @staticmethod
    def get_account_balance(db: Session, account_id: int, user_id: int) -> Optional[Decimal]:
        account = AccountService.get_account_by_id(db, account_id, user_id)
        return account.balance if account else None