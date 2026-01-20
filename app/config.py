"""
Configuration File

What:
- Stores environment variables
- JWT secret, DB URL, token expiry

Backend Connections:
- Used by:
  - auth router
  - jwt utilities
  - security utilities

Frontend Connections:
- Login.jsx & Register.jsx depend on auth behavior
  configured using values from this file
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import Field

# --- locate backend/.env explicitly ---
HERE = Path(__file__).resolve().parent  # .../backend/app
ROOT = HERE.parent  # .../backend
DOTENV = ROOT / ".env"

# load dotenv early
if DOTENV.exists():
    load_dotenv(dotenv_path=DOTENV)

# normalize lower-case keys to canonical names so subprocesses see them
if os.getenv("jwt_secret") and not os.getenv("JWT_SECRET_KEY"):
    os.environ["JWT_SECRET_KEY"] = os.getenv("jwt_secret")
if os.getenv("jwt_refresh_secret") and not os.getenv("JWT_REFRESH_SECRET_KEY"):
    os.environ["JWT_REFRESH_SECRET_KEY"] = os.getenv("jwt_refresh_secret")

# If still missing, set safe dev defaults (WARNING printed)
_missing = []
if not os.getenv("JWT_SECRET_KEY"):
    _missing.append("JWT_SECRET_KEY")
    os.environ["JWT_SECRET_KEY"] = "dev_secret_key__NOT_FOR_PRODUCTION"
if not os.getenv("JWT_REFRESH_SECRET_KEY"):
    _missing.append("JWT_REFRESH_SECRET_KEY")
    os.environ["JWT_REFRESH_SECRET_KEY"] = "dev_refresh_key__NOT_FOR_PRODUCTION"

if _missing:
    print(
        f"WARNING: Missing environment vars {_missing}. "
        "Using development fallback values. Do NOT use these in production.",
        file=sys.stderr,
    )

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_REFRESH_SECRET_KEY: str = Field(..., env="JWT_REFRESH_SECRET_KEY")

    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="refresh_token_expire_days")

    model_config = {
        "env_file": str(DOTENV) if DOTENV.exists() else ".env",
        "extra": "allow",
    }

settings = Settings()
