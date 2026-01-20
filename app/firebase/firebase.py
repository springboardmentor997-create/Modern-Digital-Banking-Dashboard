import os
import json
import firebase_admin
from firebase_admin import credentials, messaging


def init_firebase():
    if firebase_admin._apps:
        return

    firebase_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    if not firebase_json:
        raise RuntimeError("FIREBASE_CREDENTIALS_JSON not set")

    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)


def send_push_notification(token: str, title: str, body: str):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )
    messaging.send(message)
