import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Fallback to default search
    load_dotenv()


class Settings:
    # --- EMAIL SETTINGS ---
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SENDER_EMAIL = os.getenv(
        "SENDER_EMAIL", "urmilakshirsagar1945@gmail.com"
    )
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "fotb nqqx hupx abap")
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "81pr0nmNqQHYo-9StvA2klt10jbRhcQrOY5hdZZSthBPtQGA9AneCbxG0oSN8oPfmoN21QOZvZzh1XyzZvTy_w"
    )
    JWT_SECRET_KEY = SECRET_KEY 
    ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    # Calculate expiration in minutes (default 24 hours * 60 = 1440 minutes)
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

    # Database URL - prioritize environment variable
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Urmila@localhost:5433/banking_db"
    )
    
    # OTP Settings
    OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "15"))


settings = Settings()