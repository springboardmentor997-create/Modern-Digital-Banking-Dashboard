from sqlalchemy.orm import Session
from app.models.user import User
from app.auth.schemas import UserRegister, UserLogin
from app.utils.password_hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, create_refresh_token

class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserRegister):
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            return None, "Email already registered"
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            phone=user_data.phone
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user, None
    
    @staticmethod
    def login_user(db: Session, login_data: UserLogin):
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user or not verify_password(login_data.password, user.password):
            return None, "Invalid credentials"
        
        return user, None
    
    @staticmethod
    def create_tokens(user_id: int):
        access_token = create_access_token({"sub": str(user_id)})
        refresh_token = create_refresh_token({"sub": str(user_id)})
        return access_token, refresh_token
