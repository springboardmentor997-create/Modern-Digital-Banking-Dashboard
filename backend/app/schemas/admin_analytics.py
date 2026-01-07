from pydantic import BaseModel
from typing import List


class AdminAnalyticsSummary(BaseModel):
    totalUsers: int
    kycApproved: int
    kycPending: int
    kycRejected: int
    totalTransactions: int
    rewardsIssued: int


class TopUserAnalytics(BaseModel):
    name: str
    transaction_count: int
    total_amount: float
    kyc_status: str
