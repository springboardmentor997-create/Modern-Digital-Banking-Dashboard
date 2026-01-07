from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.user import User
from app.models.audit_log import AuditLog


def fetch_admin_alerts(db: Session, alert_type: str | None = None):
    query = (
        db.query(Alert, User)
        .join(User, Alert.user_id == User.id)
        .order_by(Alert.created_at.desc())
    )

    if alert_type:
        query = query.filter(Alert.type == alert_type)

    results = query.all()

    items = []
    for alert, user in results:   # ✅ EXACTLY TWO VALUES
        items.append({
            "created_at": alert.created_at,
            "user_name": user.name,   # ✅ SAFE
            "type": alert.type,
            "message": alert.message,
        })

    return {"items": items}


def fetch_admin_logs(db: Session, action: str | None = None):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())

    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.all()

    items = []
    for log in logs:
        items.append({
            "timestamp": log.timestamp,
            "admin_name": log.admin_name,
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
        })

    return {"items": items}
