import os
from datetime import datetime, timedelta, timezone
from typing import Union
from jose import jwt, JWTError
from app.config import settings

# --- CONFIGURATION ---
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"

# --- KEY LOADING (FIXED) ---
# 1. Use the key from settings (defined in config.py)
JWT_SECRET_KEY = settings.JWT_SECRET_KEY 

# 2. For Refresh Token, we use the string you provided. 
# (Ideally, add this to your Settings in config.py too, but this works for now)
JWT_REFRESH_SECRET_KEY = "56a3584c549c3932c29a0f26141f3acfb5f09f738329f01bba3c9b76d2f91c2d"

# --- ACCESS TOKEN ---
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- REFRESH TOKEN ---
def create_refresh_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- VERIFY TOKEN ---
def verify_token(token: str, credential_exception):
    try:
        # Decode using the secret key
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user_id
        user_id: str = payload.get("sub") # ✅ Changed 'user_id' to 'sub' (Standard JWT claim)
        
        # If 'sub' is missing, try 'user_id' just in case your login logic uses that
        if user_id is None:
             user_id = payload.get("user_id")

        if user_id is None:
            raise credential_exception
            
        return user_id
    except JWTError:
        raise credential_exception

def decode_jwt(token: str) -> dict:
    """Decode JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise JWTError(f"Invalid token: {e}")