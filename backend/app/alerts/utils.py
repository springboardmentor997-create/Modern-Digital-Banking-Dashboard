from app.models.user import User
from app.models.user_device import UserDevice
from app.alerts.service import create_alert
from app.utils.email_utils import send_email
from app.firebase.firebase import send_push_notification


def notify_transaction(db, user_id, settings, message):
    user = db.query(User).filter(User.id == user_id).first()

    # 🔔 Save alert
    create_alert(
        db=db,
        user_id=user_id,
        alert_type="transaction",
        message=message
    )

    # 📧 Email
    if settings.email_alerts:
        send_email(
            to_email=user.email,
            subject="Transaction Alert",
            body=message
        )

    # 📱 Push
    if settings.push_notifications:
        devices = db.query(UserDevice).filter(
            UserDevice.user_id == user_id
        ).all()

        for device in devices:
            send_push_notification(
                token=device.device_token,
                title="Transaction Alert",
                body=message
            )
