import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict
from app.config import settings

# Temporary OTP storage
otp_storage: Dict[str, str] = {}

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_otp_email(email: str) -> str:
    otp = generate_otp()
    otp_storage[email] = otp
    
    if not settings.SENDER_EMAIL or not settings.SENDER_PASSWORD:
        print(f"Missing credentials. Mock OTP for {email}: {otp}")
        return otp

    try:
        # Create Email
        message = MIMEMultipart()
        message["From"] = settings.SENDER_EMAIL
        message["To"] = email
        message["Subject"] = "Password Reset OTP"
        
        body = f"""
        <h2>Your Verification Code</h2>
        <p>Your OTP is: <strong style="color:blue; font-size:18px;">{otp}</strong></p>
        <p>Do not share this code with anyone.</p>
        """
        message.attach(MIMEText(body, "html"))
        
        # Send via Gmail
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SENDER_EMAIL, settings.SENDER_PASSWORD)
        server.sendmail(settings.SENDER_EMAIL, email, message.as_string())
        server.quit()
        
        print(f"Email sent to {email}")
        return otp
        
    except Exception as e:
        print(f"Error sending email: {e}")
        print(f"Mock OTP for testing: {otp}")
        return otp

def verify_otp_logic(email: str, otp: str) -> bool:
    stored_otp = otp_storage.get(email)
    if stored_otp and stored_otp == otp:
        del otp_storage[email]
        return True
    return False


def send_payment_link_email(recipient_email: str, payment_url: str, amount: float, description: str = None, sender_name: str = None) -> bool:
    """Send a payment link email to the given recipient. Returns True if sent, False otherwise."""
    subject = f"You've received a payment link for {amount}"
    body = f"<p>{sender_name or 'Someone'} has sent you a payment request of <strong>{amount}</strong>.</p>"
    if description:
        body += f"<p>Description: {description}</p>"
    body += f"<p>Open this link to pay: <a href=\"{payment_url}\">{payment_url}</a></p>"
    body += "<p>If you did not expect this, you can ignore this email.</p>"

    if not settings.SENDER_EMAIL or not settings.SENDER_PASSWORD:
        print(f"Missing credentials. Mock email to {recipient_email}: subject={subject}, body={body}")
        return False

    try:
        message = MIMEMultipart()
        message["From"] = settings.SENDER_EMAIL
        message["To"] = recipient_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html"))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SENDER_EMAIL, settings.SENDER_PASSWORD)
        server.sendmail(settings.SENDER_EMAIL, recipient_email, message.as_string())
        server.quit()
        print(f"Payment link email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"Error sending payment link email to {recipient_email}: {e}")
        return False