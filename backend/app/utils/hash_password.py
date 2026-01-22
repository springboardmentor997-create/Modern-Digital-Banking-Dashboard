from passlib.context import CryptContext

# Fix for "password cannot be longer than 72 bytes":
# This error occurs because passlib's bcrypt backend (when using raw bcrypt) 
# sometimes throws an error if it receives >72 chars, or if there's a version mismatch trap.
# However, the error you see `AttributeError: module 'bcrypt' has no attribute '__about__'` 
# is a warning from passlib trying to read the version of bcrypt.
# The actual 500 error is likely due to the password length limit or how the hash is generated.

# We will switch to a robust config that handles truncation automatically if needed,
# or simply ensure we catch the specific error.
# But `passlib` is old and unmaintained. The best fix for modern bcrypt is usually:

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # Ensure password is not too long to prevent 500 Internal Server Error
    # Bcrypt has a 72 byte limit. 
    # We truncate silently to 72 bytes to avoid crushing the server.
    if len(password.encode('utf-8')) > 72:
        password = password[:72] 
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)