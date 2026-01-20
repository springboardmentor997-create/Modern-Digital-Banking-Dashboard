import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_email(to_email: str, subject: str, body: str):
    # If SMTP creds are missing, silently skip
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("⚠️ SMTP credentials not set. Skipping email.")
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)

    except Exception as e:
        # 🔑 CRITICAL: never crash auth flow because of email
        print("⚠️ Email sending failed (ignored):", e)
