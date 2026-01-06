import os
import json
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()  # ye backend/.env ko load karega


DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", )
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost",
        "http://127.0.0.1",
    ]
    
    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Allow `CORS_ORIGINS` to be provided as a JSON array or a comma-separated string
# via environment variables (useful when deploying to Render or other hosts).
raw_cors = os.getenv("CORS_ORIGINS")
if raw_cors:
    try:
        parsed = json.loads(raw_cors)
        if isinstance(parsed, list):
            settings.CORS_ORIGINS = parsed
        else:
            settings.CORS_ORIGINS = [str(parsed)]
    except Exception:
        # Fallback: comma-separated list
        settings.CORS_ORIGINS = [s.strip() for s in raw_cors.split(",") if s.strip()]
