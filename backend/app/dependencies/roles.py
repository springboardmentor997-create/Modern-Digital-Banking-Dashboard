from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.user import User


def require_role(*allowed_roles: str):
    """
    Generic role checker.
    Usage:
        Depends(require_role("admin"))
        Depends(require_role("admin", "auditor"))
    """

    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient permissions",
            )
        return current_user

    return role_checker


# ---- Specific helpers (clean & readable) ----

def require_admin():
    return require_role("admin")


def require_user():
    return require_role("user")


def require_readonly():
    # auditor + support are read-only
    return require_role("auditor", "support", "admin")
