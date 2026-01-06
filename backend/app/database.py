from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
from sqlalchemy import text

DATABASE_URL = "postgresql://postgres:Urmila@localhost:5433/banking_db"

# Configure engine with proper PostgreSQL settings
if "postgresql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={
            "options": "-c timezone=utc"
        }
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
import time
from sqlalchemy.exc import OperationalError

def _wait_for_db(engine, retries: int = None, delay: int = None) -> bool:
    """Wait for database to become available. Returns True if reachable."""
    try:
        import os
        if retries is None:
            retries = int(os.getenv('DB_WAIT_RETRIES', '10'))
        if delay is None:
            delay = int(os.getenv('DB_WAIT_DELAY', '3'))
    except Exception:
        retries = 10
        delay = 3

    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"Database reachable (attempt {attempt})")
            return True
        except OperationalError as e:
            print(f"Database not reachable (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)
        except Exception as e:
            print(f"Unexpected error checking DB (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)
    print("Database was not reachable after retries")
    return False

# Try to wait for DB only if using a networked DB (Postgres). For SQLite the engine is local and immediate.
try:
    if "postgresql" in DATABASE_URL:
        _wait_for_db(engine)
except Exception:
    # Don't prevent module import on non-fatal errors
    pass

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        try:
            db.rollback()
        except Exception:
            # If rollback fails, try to close and get a fresh session
            try:
                db.close()
            except:
                pass
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass

def get_clean_db():
    """Get a database session with guaranteed clean transaction state"""
    db = SessionLocal()
    try:
        # Test the connection and rollback any pending transaction
        try:
            db.execute("SELECT 1")
            if db.in_transaction():
                db.rollback()
        except Exception:
            # If there's an issue, close and get a fresh session
            try:
                db.close()
            except:
                pass
            db = SessionLocal()
        yield db
    except Exception:
        try:
            db.rollback()
        except Exception:
            try:
                db.close()
            except:
                pass
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass

def init_database():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def create_sample_data():
    """Initialize database tables only - no default users"""
    # Just ensure tables are created, no sample data
    init_database()

def check_users():
    """Check existing users in database"""
    from app.models.user import User
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("Existing users in database:")
        for user in users:
            print(f"- Email: {user.email}, Name: {user.name}")
        return users
    finally:
        db.close()

def update_user_password(email: str, new_password: str):
    """Update user password"""
    from app.models.user import User
    from app.utils.hash_password import hash_password
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password = hash_password(new_password)
            db.commit()
            print(f"Password updated for {email}")
            return True
        else:
            print("User not found")
            return False
    finally:
        db.close()

def reset_db_connections():
    """Reset database connections to handle connection issues"""
    global engine, SessionLocal
    try:
        # Dispose existing connections
        engine.dispose()
        
        # Recreate engine
        if "postgresql" in DATABASE_URL:
            engine = create_engine(
                DATABASE_URL,
                echo=False,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={
                    "options": "-c timezone=utc"
                }
            )
        else:
            engine = create_engine(
                DATABASE_URL,
                echo=False,
                connect_args={"check_same_thread": False}
            )
        
        # Recreate session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Test connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        print("Database connections reset successfully")
        return True
        
    except Exception as e:
        print(f"Error resetting database connections: {e}")
        return False
