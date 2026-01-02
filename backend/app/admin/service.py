from sqlalchemy.orm import Session
from app.models.user import User
from app.accounts.models import Account
from app.transactions.models import Transaction
from app.alerts.models import Alert


def get_all_users(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()


def get_all_accounts(db: Session):
    return db.query(Account).order_by(Account.created_at.desc()).all()


def get_all_transactions(db: Session):
    return db.query(Transaction).order_by(Transaction.transaction_date.desc()).all()


def get_all_alerts(db):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )


def set_user_active_status(
    db: Session,
    user_id: int,
    is_active: bool,
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise ValueError("User not found")

    user.is_active = is_active
    db.commit()
    db.refresh(user)

    return user


def get_system_summary(db: Session):
    return {
        "total_users": db.query(User).count(),
        "total_accounts": db.query(Account).count(),
        "total_transactions": db.query(Transaction).count(),
        "total_alerts": db.query(Alert).count(),
    }
