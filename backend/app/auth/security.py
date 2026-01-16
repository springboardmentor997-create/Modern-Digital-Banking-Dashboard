import os
from datetime import datetime, timedelta
from typing import Union, Any
import jwt
from passlib.context import CryptContext

# --- CONFIGURATION ---
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"
# We use a consistent name 'SECRET_KEY' so dependencies.py can find it
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', "b57bf2e0f97590be77f23e051a5ac81e3149b9e0d7b553b759023877fac9048e") 
JWT_REFRESH_SECRET_KEY = os.environ.get('JWT_REFRESH_SECRET_KEY', "56a3584c549c3932c29a0f26141f3acfb5f09f738329f01bba3c9b76d2f91c2d")

# --- PASSWORD HASHING (Crucial for Login) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- ACCESS TOKEN ---
def create_access_token(subject: Union[str, Any], role: str = "user", expires_delta: Union[timedelta, None] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Include role in token payload
    to_encode = {"exp": expire, "user_id": str(subject), "role": role}
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- REFRESH TOKEN ---
def create_refresh_token(subject: Union[str, Any], expires_delta: Union[timedelta, None] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {"exp": expire, "user_id": str(subject)}
    
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt