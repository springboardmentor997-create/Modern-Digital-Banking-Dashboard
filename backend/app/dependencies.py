from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.jwt_handler import verify_token
from app.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    token_role = payload.get("role")
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Attach role from token to returned user object.
    # If the DB doesn't have a role, treat as 'user' by default.
    if token_role:
        try:
            user.role = token_role
        except Exception:
            # Silently ignore if assignment is not possible
            pass
    else:
        if not getattr(user, "role", None):
            user.role = "user"
    
    return user


class RoleChecker:
    """Dependency class for role-based access control.

    Usage: `current_user: User = Depends(RoleChecker(["admin"]))`
    """
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role = getattr(current_user, "role", "user")
        if user_role not in self.allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return current_user


# Convenience dependency callables for common role checks.
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to be an admin.

    Use as: `current_user: User = Depends(require_admin)`
    """
    user_role = getattr(current_user, "role", "user")
    if user_role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user


def require_user_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to be either a regular user or an admin.

    Use this on endpoints where owners (users) and admins are allowed.
    """
    user_role = getattr(current_user, "role", "user")
    if user_role not in ("user", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User or admin privileges required")
    return current_user


def require_auditor_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require auditor or admin role for read-only system-wide access.

    Use on endpoints that auditors may call (read-only).
    """
    user_role = getattr(current_user, "role", "user")
    if user_role not in ("auditor", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Auditor or admin privileges required")
    return current_user


def forbid_auditor_writes(request: Request, current_user: User = Depends(get_current_user)) -> None:
    """Prevent users with role 'auditor' from performing write operations.

    Use on write endpoints as: `Depends(forbid_auditor_writes)`. This allows
    auditors to call read endpoints but blocks POST/PUT/PATCH/DELETE.
    """
    user_role = getattr(current_user, "role", "user")
    if user_role == "auditor" and request.method in ("POST", "PUT", "PATCH", "DELETE"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Auditor role is read-only; write operations are forbidden")
    return None
