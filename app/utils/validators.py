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


def normalize_phone(phone: str) -> str:
    """
    Strip non-digit characters and return digits only.
    Caller should validate length afterwards (e.g. 10 digits).
    """
    digits = re.sub(r"\D", "", phone or "")
    return digits
