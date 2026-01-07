"""
Environment Configuration

What:
- Loads environment variables
- Stores secrets & environment-specific values

Backend Connections:
- Used by:
  - database.py (DB URL)
  - auth logic (JWT secrets)
  - email / alerts if enabled

Frontend Connections:
- Indirect
- Controls authentication behavior that frontend depends on
"""



import re

PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
)

def is_strong_password(password: str) -> bool:
    """
    Returns True if password has:
    - at least 8 chars
    - at least 1 uppercase
    - at least 1 lowercase
    - at least 1 digit
    - at least 1 special char
    """
    return bool(PASSWORD_REGEX.match(password))


def normalize_phone(phone) -> str:
    """
    Strip non-digit characters and return digits only.
    Accepts int or string safely.
    """
    phone_str = str(phone) if phone is not None else ""
    digits = re.sub(r"\D", "", phone_str)
    return digits
