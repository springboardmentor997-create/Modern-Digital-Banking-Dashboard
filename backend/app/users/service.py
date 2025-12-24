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
    def get_profile(user: User) -> User:
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
