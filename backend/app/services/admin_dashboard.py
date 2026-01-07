from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date

from app.models.user import User
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.user import KYCStatus


def get_admin_dashboard_summary(db: Session):
    # TOTAL USERS
    total_users = db.query(func.count(User.id)).scalar()

    # KYC PENDING
    kyc_pending = (
        db.query(func.count(User.id))
        .filter(User.kyc_status == KYCStatus.unverified)
        .scalar()
    )

    # TODAY TRANSACTIONS
    today_transactions = (
        db.query(func.count(Transaction.id))
        .filter(cast(Transaction.txn_date, Date) == date.today())
        .scalar()
    )

    # ACTIVE ALERTS (unread)
    active_alerts = (
        db.query(func.count(Alert.id))
        .filter(Alert.is_read == False)
        .scalar()
    )

    return {
        "total_users": total_users,
        "kyc_pending": kyc_pending,
        "today_transactions": today_transactions,
        "active_alerts": active_alerts,
    }
