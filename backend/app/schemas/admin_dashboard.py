from pydantic import BaseModel

class AdminDashboardSummary(BaseModel):
    total_users: int
    kyc_pending: int
    today_transactions: int
    active_alerts: int
