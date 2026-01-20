"""
Schemas for Admin Alerts & Audit Logs
"""

from pydantic import BaseModel
from datetime import datetime


# ---------------- ALERTS ----------------
class AdminAlertOut(BaseModel):
    created_at: datetime
    user_name: str | None
    type: str
    message: str

    class Config:
        from_attributes = True


# ---------------- LOGS ----------------
class AdminLogOut(BaseModel):
    timestamp: datetime
    admin_name: str
    action: str
    target_type: str | None
    target_id: int | None
    details: str | None

    class Config:
        from_attributes = True
