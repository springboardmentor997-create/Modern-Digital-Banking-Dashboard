from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, KYCStatus
from app.models.transaction import Transaction
from app.models.reward import Reward


def get_admin_analytics_summary(db: Session):
    total_users = db.query(func.count(User.id)).scalar()

    kyc_approved = db.query(func.count(User.id)) \
        .filter(User.kyc_status == KYCStatus.verified) \
        .scalar()

    kyc_pending = db.query(func.count(User.id)) \
        .filter(User.kyc_status == KYCStatus.unverified) \
        .scalar()

    kyc_rejected = db.query(func.count(User.id)) \
        .filter(User.kyc_status == KYCStatus.rejected) \
        .scalar()


    total_transactions = db.query(func.count(Transaction.id)).scalar()

    rewards_issued = db.query(func.count(Reward.id)).scalar()

    return {
        "totalUsers": total_users,
        "kycApproved": kyc_approved,
        "kycPending": kyc_pending,
        "kycRejected": kyc_rejected,
        "totalTransactions": total_transactions,
        "rewardsIssued": rewards_issued,
    }


def get_top_users_by_activity(db: Session, limit: int = 5):
    results = (
        db.query(
            User.name.label("name"),
            func.count(Transaction.id).label("transaction_count"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_amount"),
            User.kyc_status.label("kyc_status"),
        )
        .join(Transaction, Transaction.user_id == User.id)
        .group_by(User.id)
        .order_by(func.count(Transaction.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": r.name,
            "transaction_count": r.transaction_count,
            "total_amount": float(r.total_amount),
            "kyc_status": r.kyc_status.value,
        }
        for r in results
    ]
