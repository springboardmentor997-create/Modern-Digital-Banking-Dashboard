from datetime import datetime, timedelta
import jwt
from typing import Any
from app.config import settings

ALGORITHM = settings.JWT_ALGORITHM

def _now():
    return datetime.utcnow()

def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    exp = _now() + timedelta(minutes=(expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: dict[str, Any] = {"sub": str(subject), "exp": exp, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(subject: str | int, expires_days: int | None = None) -> str:
    exp = _now() + timedelta(days=(expires_days or settings.REFRESH_TOKEN_EXPIRE_DAYS))
    payload: dict[str, Any] = {"sub": str(subject), "exp": exp, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])

def decode_refresh_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
