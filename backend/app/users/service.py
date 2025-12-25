import json
import threading
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user import KycStatusEnum
from app.utils.password_hash import hash_password, verify_password

_settings_lock = threading.Lock()
_settings_file = "./user_settings.json"


def _load_all_settings() -> Dict[str, Any]:
    try:
        with _settings_lock:
            with open(_settings_file, "r", encoding="utf-8") as f:
                return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception:
        return {}


def _save_all_settings(all_settings: Dict[str, Any]):
    with _settings_lock:
        with open(_settings_file, "w", encoding="utf-8") as f:
            json.dump(all_settings, f, indent=2)


class UserService:
    @staticmethod
    def get_profile(db: Session, user: User) -> User:
        # Attach a list of account summaries to the user object for the profile
        from app.models.account import Account

        accounts = db.query(Account).filter(Account.user_id == user.id).all()
        # convert to simple dicts for JSON/Pydantic
        acct_list = [
            {
                "id": a.id,
                "bank_name": a.bank_name,
                "account_type": a.account_type.value if hasattr(a.account_type, 'value') else a.account_type,
                "masked_account": a.masked_account,
                "currency": a.currency,
                "balance": float(a.balance) if a.balance is not None else None,
                "created_at": a.created_at,
            }
            for a in accounts
        ]

        # Attach dynamically so pydantic `from_attributes` can pick it up if needed
        setattr(user, "accounts", acct_list)
        return user

    @staticmethod
    def update_profile(db: Session, user: User, data: Dict[str, Any]):
        if data.get("name") is not None:
            user.name = data.get("name")
        if data.get("email") is not None:
            user.email = data.get("email")
        if data.get("phone") is not None:
            user.phone = data.get("phone")
        # location is not stored in DB; ignore or store in settings
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_settings(user_id: int) -> Dict[str, Any]:
        all_settings = _load_all_settings()
        return all_settings.get(str(user_id), {})

    @staticmethod
    def update_settings(user_id: int, settings: Dict[str, Any]):
        all_settings = _load_all_settings()
        all_settings[str(user_id)] = settings
        _save_all_settings(all_settings)
        return all_settings[str(user_id)]

    @staticmethod
    def change_password(db: Session, user: User, current_password: str, new_password: str) -> Optional[str]:
        if not verify_password(current_password, user.password):
            return "Current password is incorrect"

        user.password = hash_password(new_password)
        db.add(user)
        db.commit()
        return None

    @staticmethod
    def verify_kyc(db: Session, user: User):
        # Set the user's KYC status to verified and persist
        user.kyc_status = KycStatusEnum.verified
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_account(db: Session, user: User):
        """Delete the given user and remove their stored settings."""
        try:
            # Remove user-specific settings if present
            all_settings = _load_all_settings()
            if str(user.id) in all_settings:
                del all_settings[str(user.id)]
                _save_all_settings(all_settings)

            # Delete the user record
            db.delete(user)
            db.commit()
            return True
        except Exception:
            db.rollback()
            raise
