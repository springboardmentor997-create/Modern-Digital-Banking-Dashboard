from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi.security import OAuth2PasswordBearer
from app.models.user import User
import jwt
from app.auth.security import SECRET_KEY, ALGORITHM 

security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Simple token-based authentication
def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get('authorization')
    
    if not auth_header:
        print("DEBUG: Authorization header missing")
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        if not auth_header.startswith("Bearer "):
            print(f"DEBUG: Invalid authorization format: {auth_header[:10]}...")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = auth_header.split(" ")[1]
        
        # Use JWT token validation
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id") or payload.get("sub")
            
            if user_id is None:
                print(f"DEBUG: Token missing user_id: {payload}")
                raise HTTPException(status_code=401, detail="Invalid token: user_id missing")
            
            # Get the user from database (don't filter by is_active here)
            user = db.query(User).filter(User.id == int(user_id)).first()
            
            if not user:
                print(f"DEBUG: User not found for ID: {user_id}")
                raise HTTPException(status_code=401, detail="User not found")
                
            return user
            
        except jwt.ExpiredSignatureError:
            print("DEBUG: Token expired")
            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as e:
            print(f"DEBUG: JWT decode error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def require_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        print(f"DEBUG: User {current_user.email} is inactive")
        raise HTTPException(status_code=401, detail="Account is deactivated")
    return current_user

# JWT-based authentication (for proper token validation)
async def get_current_user_jwt(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if isinstance(payload, str):
            raise credentials_exception
            
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

# Role-based access control dependencies
def require_admin(current_user: User = Depends(require_active_user)):
    """Require admin role - System Admin with full access"""
    from app.models.user import UserRole
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, 
            detail="Admin access required. This action is restricted to system administrators."
        )
    return current_user

def require_user(current_user: User = Depends(require_active_user)):
    """Require user role - Regular customer/end user"""
    from app.models.user import UserRole
    if current_user.role not in [UserRole.user, UserRole.admin]:
        raise HTTPException(
            status_code=403, 
            detail="User access required. This action is for account holders."
        )
    return current_user

def require_auditor(current_user: User = Depends(require_active_user)):
    """Require auditor role - Read-only compliance access"""
    from app.models.user import UserRole
    if current_user.role not in [UserRole.auditor, UserRole.admin]:
        raise HTTPException(
            status_code=403, 
            detail="Auditor access required. This action is for compliance and audit purposes."
        )
    return current_user

def require_support(current_user: User = Depends(require_active_user)):
    """Require support role - Customer support access"""
    from app.models.user import UserRole
    if current_user.role not in [UserRole.support, UserRole.admin]:
        raise HTTPException(
            status_code=403, 
            detail="Support access required. This action is for customer support staff."
        )
    return current_user

def require_any_staff(current_user: User = Depends(require_active_user)):
    """Require any staff role (admin, auditor, or support)"""
    from app.models.user import UserRole
    if current_user.role not in [UserRole.admin, UserRole.auditor, UserRole.support]:
        raise HTTPException(
            status_code=403, 
            detail="Staff access required. This action is restricted to staff members."
        )
    return current_user

# Database reset function
def reset_database():
    """Reset database by dropping and recreating all tables"""
    from app.models import Base
    from app.database import engine
    
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Database reset complete!")
    except Exception as e:
        print(f"Error resetting database: {e}")