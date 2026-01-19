from pydantic import BaseModel
from typing import Optional, Dict, Any


class UpdateProfile(BaseModel):
    name: Optional[str] = None
    # accept raw string here; router will validate non-empty emails
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class UserSettings(BaseModel):
    notifications: Optional[bool] = True
    emailAlerts: Optional[bool] = True
    twoFactor: Optional[bool] = False
    darkMode: Optional[bool] = False
    currency: Optional[str] = "INR"
    language: Optional[str] = "English"


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
