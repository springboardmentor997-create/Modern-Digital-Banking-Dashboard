import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hash password using SHA256 with salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        salt, pwd_hash = hashed_password.split('$')
        return hashlib.sha256((plain_password + salt).encode()).hexdigest() == pwd_hash
    except:
        return False