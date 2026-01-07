import firebase_admin
from firebase_admin import credentials, messaging
import os

# -------------------------------
# Firebase Initialization (SAFE)
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIREBASE_KEY_PATH = os.path.join(BASE_DIR, "config", "firebase_key.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)


# -------------------------------
# Push Notification Sender
# -------------------------------
def send_push_notification(token: str, title: str, body: str):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )

    try:
        messaging.send(message)
    except Exception:
        pass
